
import { Card, Container, Stack, Text, Title, Box, SimpleGrid } from '@mantine/core';
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

  const destinations = (qrData.destinations || []).sort((a: any, b: any) => a.position - b.position);
  const total = destinations.length;
  const colsConfig = {
    base: Math.max(Math.min(total, 2), 1),
    sm: Math.max(Math.min(total, 3), 1),
    md: Math.max(Math.min(total, 4), 1),
    lg: Math.max(Math.min(total, 5), 1),
    xl: Math.max(Math.min(total, 6), 1),
  };

  return (
    <Container size="xs" py="xl">
      <Stack gap="xl" align="center">
        {qrData.heroImage && (
          <Box
            style={{
              width: '100%',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <img
              src={qrData.heroImage}
              alt={`${qrData.title} hero`}
              style={{ maxHeight: 320, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
            />
          </Box>
        )}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <Title order={1} size="h1">{qrData.title}</Title>
        </div>

        {total > 0 ? (
          <SimpleGrid
            w="100%"
            spacing="lg"
            cols={colsConfig}
          >
            {destinations.map((dest: any) => (
              <Card
                key={dest.id}
                padding="lg"
                radius={28}
                withBorder={false}
                component="a"
                href={dest.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'transparent',
                  boxShadow: 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                  padding: '0',
                }}
              >
                <Stack gap="sm" align="center">
                  <Box
                    style={{
                      width: 'clamp(88px, 22vw, 140px)',
                      height: 'clamp(88px, 22vw, 140px)',
                      borderRadius: 32,
                      overflow: 'hidden',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {dest.image ? (
                      <img
                        src={dest.image}
                        alt={dest.title || 'Destination'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Text size="sm" c="dimmed">
                        {dest.title?.[0] || '?'}
                      </Text>
                    )}
                  </Box>
                  <Text fw={600} size="sm" ta="center">
                    {dest.title || 'Untitled'}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed" ta="center">
            No destinations configured
          </Text>
        )}

        <Text size="xs" c="dimmed" ta="center">
          Powered by QR-Gen Studio
        </Text>
      </Stack>
    </Container>
  );
}

