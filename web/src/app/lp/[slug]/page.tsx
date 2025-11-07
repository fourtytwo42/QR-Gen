'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Card, Stack, Text, Button, Container, Title, Center, Loader } from '@mantine/core';
import { IconExternalLink, IconAlertCircle } from '@tabler/icons-react';
import { getSavedQRs, SavedQR } from '@/lib/localStorage';

interface Props {
  params: { slug: string };
}

/**
 * Multi-link landing page
 */
export default function LandingPage({ params }: Props) {
  const { slug } = params;
  const router = useRouter();
  const [qrData, setQrData] = useState<SavedQR | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[Landing Page] Looking for slug:', slug);

    // Find QR by slug in localStorage
    const savedQRs = getSavedQRs();
    const qr = savedQRs.find((q) => q.slug === slug);

    if (!qr) {
      console.log('[Landing Page] QR not found');
      setLoading(false);
      return;
    }

    console.log('[Landing Page] Found QR:', qr);
    setQrData(qr);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Stack align="center" gap="lg">
          <Loader size="xl" />
          <Text c="dimmed">Loading...</Text>
        </Stack>
      </Center>
    );
  }

  if (!qrData) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="red">
          This QR code could not be found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl" align="center">
        <div style={{ textAlign: 'center' }}>
          <Title order={1} size="h2">{qrData.title}</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Select a destination below
          </Text>
        </div>

        <Stack gap="md" w="100%">
          {qrData.destinations && qrData.destinations.length > 0 ? (
            qrData.destinations
              .sort((a, b) => a.position - b.position)
              .map((dest) => (
                <Card 
                  key={dest.id} 
                  padding="lg" 
                  radius="lg" 
                  withBorder
                  component="a"
                  href={dest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  <Stack gap="xs">
                    <Text fw={600} size="lg">{dest.title || 'Untitled'}</Text>
                    <Text size="sm" c="dimmed" style={{ wordBreak: 'break-all' }}>
                      {dest.url}
                    </Text>
                    <Button 
                      variant="light" 
                      rightSection={<IconExternalLink size={16} />}
                      fullWidth
                      mt="xs"
                    >
                      Visit
                    </Button>
                  </Stack>
                </Card>
              ))
          ) : (
            <Text c="dimmed" ta="center">No destinations configured</Text>
          )}
        </Stack>

        <Text size="xs" c="dimmed" ta="center">
          Powered by QR-Gen Studio
        </Text>
      </Stack>
    </Container>
  );
}

