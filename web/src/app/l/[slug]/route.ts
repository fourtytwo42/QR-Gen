import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query as dbQuery } from '@/lib/db';
import { hashIP, parseDeviceCategory, extractDomain, sha256Hash } from '@/lib/utils';
import { lookupIPLocation, lookupIPLocationMock } from '@/lib/geolite2';

export const dynamic = 'force-dynamic';

/**
 * Public QR scan endpoint
 * GET /l/{slug}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Fetch QR record
    const qr = await queryOne<any>(
      `SELECT * FROM qr WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (!qr) {
      return new NextResponse('QR code not found', { status: 404 });
    }

    // Track scan event asynchronously (don't block redirect)
    trackScanEvent(request, qr.id, slug).catch(err => 
      console.error('Error tracking scan:', err)
    );

    // Single mode: redirect immediately
    if (qr.mode === 'single' && qr.default_destination_url) {
      return NextResponse.redirect(qr.default_destination_url, {
        status: 302,
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      });
    }

    // Multi mode: redirect to landing page
    const landingUrl = new URL(`/lp/${slug}`, request.url);
    return NextResponse.redirect(landingUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error processing QR scan:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * Track scan event for analytics
 */
async function trackScanEvent(request: NextRequest, qrId: string, slug: string) {
  try {
    // Extract request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '0.0.0.0';
    const referrer = request.headers.get('referer') || '';

    // Hash sensitive data
    const ipHash = hashIP(ip);
    const userAgentHash = sha256Hash(userAgent);
    
    // Parse device category
    const deviceCategory = parseDeviceCategory(userAgent);
    
    // Extract referrer domain
    const referrerDomain = referrer ? extractDomain(referrer) : null;

    // Lookup geolocation (use mock for development if GeoLite2 not configured)
    let location = await lookupIPLocation(ip);
    if (!location.countryIso && process.env.NODE_ENV === 'development') {
      location = await lookupIPLocationMock(ip);
    }

    // Insert scan event
    await dbQuery(
      `INSERT INTO qr_scan_event (
        qr_id, public_slug_snapshot, user_agent_hash, ip_hash,
        country_iso, city_name, referrer_domain, device_category, ts
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        qrId,
        slug,
        userAgentHash,
        ipHash,
        location.countryIso,
        location.cityName,
        referrerDomain,
        deviceCategory,
      ]
    );
  } catch (error) {
    console.error('Error tracking scan event:', error);
    // Don't throw - tracking errors shouldn't break the scan flow
  }
}

