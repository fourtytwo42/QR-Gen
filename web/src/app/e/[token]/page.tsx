'use server';

import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { getQRByEditorToken } from '@/app/actions/qr-actions';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { token } = await params;

  console.log('[EditorPage] Fetching QR from database for token:', token);

  const qrData = await getQRByEditorToken(token);

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
    destinations: qrData.destinations.map((d: any) => ({
      id: d.id,
      title: d.title,
      url: d.url,
      position: d.position,
      scans: 0,
    })),
    style: {
      fgColor: qrData.fg_color,
      bgColor: qrData.bg_color,
      gradient: qrData.gradient_json ? JSON.parse(qrData.gradient_json) : undefined,
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
      destinations: [],
    },
    lastPublishedAt: qrData.last_published_at || new Date().toISOString(),
    bookmarkedHint: 'This is your private editor link. Save it now. Anyone with the link can edit.',
  };

  return (
    <SiteShell>
      <EditorDashboard record={record} />
    </SiteShell>
  );
}
