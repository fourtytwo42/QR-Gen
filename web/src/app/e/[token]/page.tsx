'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Center, Loader, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { SiteShell } from '@/components/layout/SiteShell';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { getQRByEditorToken } from '@/app/actions/qr-actions';

type Props = {
  params: { token: string };
};

export default function EditorPage({ params }: Props) {
  const { token } = params;
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      document.title = `Editor · ${token?.slice(0, 8) || 'Loading'}`;
      
      console.log('[EditorPage] Fetching QR from database for token:', token);
      
      // Fetch from PostgreSQL database
      const qrData = await getQRByEditorToken(token);

      if (!qrData) {
        console.log('[EditorPage] QR not found in database');
        setError('QR code not found. It may not have been published yet.');
        setLoading(false);
        return;
      }

      console.log('[EditorPage] ✅ Found QR in database:', qrData.title);

      // Transform database record to EditorRecord format
      const editorRecord = {
        id: qrData.id,
        title: qrData.title,
        slug: qrData.slug,
        mode: qrData.mode,
        passwordProtected: !!qrData.editor_password_hash,
        quietZone: qrData.quiet_zone_modules,
        ecc: qrData.ecc_level,
        destinations: qrData.destinations.map((d: any, index: number) => ({
          id: d.id,
          title: d.title,
          url: d.url,
          position: d.position,
          scans: 0, // From analytics
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

      console.log('[EditorPage] Editor record with analytics:', editorRecord);

      setRecord(editorRecord);
      setLoading(false);
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <SiteShell>
        <Center style={{ minHeight: '60vh' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading QR editor...</Text>
          </Stack>
        </Center>
      </SiteShell>
    );
  }

  if (error || !record) {
    return (
      <SiteShell>
        <Center style={{ minHeight: '60vh' }}>
          <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="red" maw={500}>
            {error || 'This QR code could not be found. It may have been deleted from your browser storage.'}
          </Alert>
        </Center>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <EditorDashboard record={record} />
    </SiteShell>
  );
}
