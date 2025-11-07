'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Center, Loader, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { SiteShell } from '@/components/layout/SiteShell';
import { EditorDashboard } from '@/components/editor/EditorDashboard';
import { getSavedQRs } from '@/lib/localStorage';

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
    if (typeof window === 'undefined') return;
    
    document.title = `Editor · ${token?.slice(0, 8) || 'Loading'}`;
    
    // Load from localStorage
    const savedQRs = getSavedQRs();
    console.log('[EditorPage] Looking for token:', token);
    console.log('[EditorPage] Saved QRs:', savedQRs);
    
    // Try to find by editorToken first, then by id (for backwards compatibility)
    const qrData = savedQRs.find((qr) => qr.editorToken === token || qr.id === token);

    if (!qrData) {
      console.log('[EditorPage] QR not found in localStorage');
      setError('QR code not found. It may have been deleted or never existed.');
      setLoading(false);
      return;
    }

    console.log('[EditorPage] Found QR data:', qrData);

    // Transform localStorage data to EditorRecord format
    const editorRecord = {
      id: qrData.id || token,
      title: qrData.title || 'Untitled QR',
      slug: qrData.slug || 'untitled',
      mode: 'single' as const, // Default for now
      passwordProtected: false,
      quietZone: 4,
      ecc: 'H' as const,
      destinations: [
        {
          id: 'dest-1',
          title: 'Primary',
          url: qrData.editorUrl || qrData.slug ? `https://qrgen.link/${qrData.slug}` : 'https://qrgen.link/demo',
          position: 0,
          scans: 0,
        },
      ],
      style: {
        fgColor: qrData.style?.fgColor || '#000000',
        bgColor: qrData.style?.bgColor || '#ffffff',
        gradient: qrData.style?.gradient || undefined,
        moduleStyle: 'dot' as const,
        eyeStyle: 'square' as const,
        quietZone: 4,
        ecc: 'H' as const,
        withLogo: false,
        logoSizeRatio: 0.22,
      },
      analytics: {
        totalScans: 0,
        uniqueScans: 0,
        topCountries: [],
        devices: [],
        destinations: [],
      },
      lastPublishedAt: qrData.createdAt || new Date().toISOString(),
      bookmarkedHint: 'This is your private editor link. Save it now. Anyone with the link can edit.',
    };

    console.log('[EditorPage] Created editor record:', editorRecord);

    setRecord(editorRecord);
    setLoading(false);
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
