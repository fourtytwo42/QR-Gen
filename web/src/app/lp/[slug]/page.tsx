
import { Alert, Card, Stack, Text, Button, Container, Title } from '@mantine/core';
import { IconExternalLink, IconAlertCircle } from '@tabler/icons-react';
import { getQRBySlug } from '@/app/actions/qr-actions';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Multi-link landing page
 */
export default async function LandingPage({ params }: Props) {
  const { slug } = await params;

  console.log('[Landing Page] Fetching QR from database for slug:', slug);

  const qrData = await getQRBySlug(slug);

  if (!qrData) {
    console.log('[Landing Page] QR not found in database');
    notFound();
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
              .sort((a: any, b: any) => a.position - b.position)
              .map((dest: any) => (
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
                    {dest.image && (
                      <img
                        src={dest.image}
                        alt={dest.title || 'Destination image'}
                        style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12 }}
                      />
                    )}
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

