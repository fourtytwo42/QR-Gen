'use server';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { getQRByEditorToken } from '@/app/actions/qr-actions';

interface Props {
  params: Promise<{ token: string }>;
}

function parseGradientValue(value: unknown): [string, string] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value) && value.length === 2) {
    return [String(value[0]), String(value[1])];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length === 2) {
        return [String(parsed[0]), String(parsed[1])];
      }
    } catch {
      if (value.includes(',')) {
        const parts = value.split(',').map((part) => part.trim());
        if (parts.length === 2) {
          return [parts[0], parts[1]];
        }
      }
    }
  }
  return undefined;
}

export default async function EditorPage({ params }: Props) {
  const { token } = await params;

  console.log('[EditorPage] Fetching QR from database for token:', token);

  const qrData = await getQRByEditorToken(token);

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') || process.env.NEXT_PUBLIC_BASE_URL?.split('://')[0] || 'http';
  const host = hdrs.get('host') || process.env.NEXT_PUBLIC_BASE_URL?.split('://')[1] || 'localhost:3000';
  const origin = `${proto}://${host}`.replace(/\/$/, '');

  if (!qrData) {
    console.log('[EditorPage] QR not found in database');
    notFound();
  }

  const record = {
    id: qrData.id,
    title: qrData.title,
    slug: qrData.slug,
    mode: qrData.mode,
    passwordProtected: !!qrData.editor_password_hash,
    quietZone: qrData.quiet_zone_modules,
    ecc: qrData.ecc_level,
    destinations: qrData.destinations.map((d) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      position: d.position,
      image: d.image ?? undefined,
      scans: d.scans ?? 0,
    })),
    heroImage: qrData.heroImage || undefined,
    style: {
      fgColor: qrData.fg_color,
      bgColor: qrData.bg_color,
      gradient: parseGradientValue(qrData.gradient_json),
      moduleStyle: qrData.module_style,
      eyeStyle: qrData.eye_style,
      quietZone: qrData.quiet_zone_modules,
      ecc: qrData.ecc_level,
      withLogo: !!qrData.logo_object_key,
      logoSizeRatio: qrData.logo_size_ratio,
    },
    analytics: qrData.analytics || {
      totalScans: 0,
      uniqueScans: 0,
      topCountries: [],
      devices: [],
    },
    lastPublishedAt: qrData.last_published_at || new Date().toISOString(),
    bookmarkedHint: undefined,
    origin,
  };

  return (
    <SiteShell>
      <EditorDashboard record={record} />
    </SiteShell>
  );
}
