'use server';

import { query, queryOne, transaction } from '@/lib/db';
import { generateBase58Slug, generateEditorToken, sha256Hash, hashPassword, normalizeURL } from '@/lib/utils';
import { generateQRAssets } from '@/lib/qr-generator';
import { generateQRPDF } from '@/lib/pdf-generator';
import { QrStyle, QrMode, Destination } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface CreateQRInput {
  title: string;
  slug: string;
  editorToken: string;
  mode: QrMode;
  destinations: Array<{ id: string; title: string; url: string; position: number; image?: string }>;
  style: {
    fgColor: string;
    bgColor: string;
    gradient?: [string, string];
  };
  password?: string;
}

export interface CreateQRResult {
  success: boolean;
  qrId?: string;
  slug?: string;
  editorToken?: string;
  error?: string;
}

/**
 * Create a new QR code
 */
export async function createQR(input: CreateQRInput): Promise<CreateQRResult> {
  try {
    console.log('[createQR] Starting with input:', { slug: input.slug, mode: input.mode, destCount: input.destinations.length });

    // Validate URLs
    const firstDestUrl = input.destinations[0]?.url;
    if (!firstDestUrl) {
      return { success: false, error: 'At least one destination is required' };
    }

    // Use the pre-generated slug and editorToken from wizard
    const slug = input.slug;
    const editorToken = input.editorToken;
    const editorTokenHash = sha256Hash(editorToken);

    // Hash password if provided
    let passwordHash: string | null = null;
    if (input.password) {
      passwordHash = await hashPassword(input.password);
    }

    const result = await transaction(async (client) => {
      // Insert QR record
      const qrResult = await client.query(
        `INSERT INTO qr (
          slug, title, mode, default_destination_url, editor_token_hash, editor_password_hash,
          ecc_level, quiet_zone_modules, module_style, eye_style, fg_color, bg_color,
          gradient_json, logo_size_ratio, last_published_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), 'active')
        RETURNING id`,
        [
          slug,
          input.title,
          input.mode,
          firstDestUrl, // Use first destination as default
          editorTokenHash,
          passwordHash,
          'H', // Default ECC to H
          4,   // Default quiet zone
          'dot', // Default module style
          'rounded', // Default eye style
          input.style.fgColor,
          input.style.bgColor,
          input.style.gradient ? JSON.stringify(input.style.gradient) : null,
          0.22, // Default logo size
        ]
      );

      const qrId = qrResult.rows[0].id;
      console.log('[createQR] Created QR with ID:', qrId);

      // Insert destinations
      for (const dest of input.destinations) {
        await client.query(
          `INSERT INTO qr_destination (qr_id, title, url, position)
           VALUES ($1, $2, $3, $4)`,
          [qrId, dest.title, dest.url, dest.position]
        );
      }
      console.log('[createQR] Inserted', input.destinations.length, 'destinations');

      return { qrId, slug };
    });

    console.log('[createQR] ✅ Successfully saved to database!');

    revalidatePath('/qr/new');
    revalidatePath(`/l/${slug}`);
    revalidatePath(`/e/${editorToken}`);

    return {
      success: true,
      qrId: result.qrId,
      slug: result.slug,
      editorToken,
    };
  } catch (error) {
    console.error('[createQR] ❌ Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create QR code',
    };
  }
}

/**
 * Get QR by slug (for public redirect)
 */
export async function getQRBySlug(slug: string) {
  try {
    console.log('[getQRBySlug] Looking for slug:', slug);
    
    const qr = await queryOne<any>(
      `SELECT * FROM qr WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (!qr) {
      console.log('[getQRBySlug] QR not found');
      return null;
    }

    console.log('[getQRBySlug] Found QR:', qr.id);

    // Get destinations
    const destinations = await query<any>(
      `SELECT * FROM qr_destination WHERE qr_id = $1 ORDER BY position`,
      [qr.id]
    );

    console.log('[getQRBySlug] Found', destinations.length, 'destinations');

    return {
      ...qr,
      destinations,
    };
  } catch (error) {
    console.error('[getQRBySlug] Error:', error);
    return null;
  }
}

/**
 * Get QR by editor token
 */
export async function getQRByEditorToken(editorToken: string) {
  try {
    const tokenHash = sha256Hash(editorToken);
    
    const qr = await queryOne<any>(
      `SELECT * FROM qr WHERE editor_token_hash = $1 AND status = 'active'`,
      [tokenHash]
    );

    if (!qr) {
      return null;
    }

    // Get destinations
    const destinations = await query<any>(
      `SELECT * FROM qr_destination WHERE qr_id = $1 ORDER BY position`,
      [qr.id]
    );

    // Get analytics
    const analytics = await getQRAnalytics(qr.id);

    return {
      ...qr,
      destinations,
      analytics,
    };
  } catch (error) {
    console.error('Error fetching QR:', error);
    return null;
  }
}

/**
 * Update QR styling and regenerate assets
 */
export async function updateQRStyle(qrId: string, style: QrStyle) {
  try {
    await query(
      `UPDATE qr SET
        ecc_level = $1,
        quiet_zone_modules = $2,
        module_style = $3,
        eye_style = $4,
        fg_color = $5,
        bg_color = $6,
        gradient_json = $7,
        logo_size_ratio = $8,
        last_published_at = NOW()
      WHERE id = $9`,
      [
        style.ecc,
        style.quietZone,
        style.moduleStyle,
        style.eyeStyle,
        style.fgColor,
        style.bgColor,
        style.gradient ? JSON.stringify(style.gradient) : null,
        style.logoSizeRatio,
        qrId,
      ]
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating QR style:', error);
    return { success: false, error: 'Failed to update style' };
  }
}

/**
 * Download QR assets
 */
export async function downloadQRAssets(slug: string, format: 'svg' | 'png' | 'pdf') {
  try {
    const qr = await queryOne<any>('SELECT * FROM qr WHERE slug = $1', [slug]);
    
    if (!qr) {
      throw new Error('QR not found');
    }

    const style: QrStyle = {
      fgColor: qr.fg_color,
      bgColor: qr.bg_color,
      gradient: qr.gradient_json ? JSON.parse(qr.gradient_json) : undefined,
      moduleStyle: qr.module_style,
      eyeStyle: qr.eye_style,
      quietZone: qr.quiet_zone_modules,
      ecc: qr.ecc_level,
      withLogo: !!qr.logo_object_key,
      logoSizeRatio: qr.logo_size_ratio,
    };

    const publicUrl = `https://qr-gen.studio/l/${slug}`;
    const assets = await generateQRAssets({ text: publicUrl, style });

    if (format === 'svg') {
      return { data: assets.svg, mimeType: 'image/svg+xml' };
    } else if (format === 'png') {
      return { data: assets.png2048, mimeType: 'image/png' };
    } else if (format === 'pdf') {
      const destinations = await query<any>(
        'SELECT title, url FROM qr_destination WHERE qr_id = $1 ORDER BY position',
        [qr.id]
      );

      const pdf = await generateQRPDF({
        title: qr.title,
        slug: qr.slug,
        qrPngBuffer: assets.png512,
        publicUrl,
        destinations,
        style: {
          fgColor: qr.fg_color,
          bgColor: qr.bg_color,
          ecc: qr.ecc_level,
          quietZone: qr.quiet_zone_modules,
        },
      });

      return { data: pdf, mimeType: 'application/pdf' };
    }

    throw new Error('Invalid format');
  } catch (error) {
    console.error('Error downloading assets:', error);
    throw error;
  }
}

/**
 * Get QR analytics
 */
export async function getQRAnalytics(qrId: string) {
  try {
    // Total and unique scans
    const scanStats = await queryOne<any>(
      `SELECT 
        COUNT(*) as total_scans,
        COUNT(DISTINCT ip_hash) as unique_scans
      FROM qr_scan_event 
      WHERE qr_id = $1`,
      [qrId]
    );

    // Top countries
    const topCountries = await query<any>(
      `SELECT 
        country_iso as label,
        COUNT(*) as value
      FROM qr_scan_event
      WHERE qr_id = $1 AND country_iso IS NOT NULL
      GROUP BY country_iso
      ORDER BY value DESC
      LIMIT 5`,
      [qrId]
    );

    // Device breakdown
    const devices = await query<any>(
      `SELECT 
        device_category as label,
        COUNT(*) as value
      FROM qr_scan_event
      WHERE qr_id = $1 AND device_category IS NOT NULL
      GROUP BY device_category
      ORDER BY value DESC`,
      [qrId]
    );

    return {
      totalScans: parseInt(scanStats?.total_scans || '0'),
      uniqueScans: parseInt(scanStats?.unique_scans || '0'),
      topCountries: topCountries.map(c => ({ label: c.label, value: parseInt(c.value) })),
      devices: devices.map(d => ({ label: d.label, value: parseInt(d.value) })),
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      totalScans: 0,
      uniqueScans: 0,
      topCountries: [],
      devices: [],
    };
  }
}

