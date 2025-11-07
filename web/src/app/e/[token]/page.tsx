import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SiteShell } from '@/components/layout/SiteShell';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { getQRByEditorToken } from '@/app/actions/qr-actions';

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Editor · ${token.slice(0, 8)}`,
  };
}

export default async function EditorPage({ params }: Props) {
  const { token } = await params;
  
  if (!token) {
    notFound();
  }

  const qrData = await getQRByEditorToken(token);
  
  if (!qrData) {
    notFound();
  }

  // Transform database record to EditorRecord format
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
      scans: 0, // TODO: fetch from analytics
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
    analytics: {
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
