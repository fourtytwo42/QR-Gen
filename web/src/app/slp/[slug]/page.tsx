import { Box, Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';
import { getShortLinkBySlug } from '@/app/actions/short-actions';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ShortLinkLandingPage({ params }: Props) {
  const { slug } = await params;

  const shortLink = await getShortLinkBySlug(slug);

  if (!shortLink) {
    notFound();
  }

  const destinations = shortLink.destinations.sort((a, b) => a.position - b.position);
  const total = destinations.length;
  const colsConfig = {
    base: Math.max(Math.min(total || 1, 2), 1),
    sm: Math.max(Math.min(total || 1, 3), 1),
    md: Math.max(Math.min(total || 1, 4), 1),
    lg: Math.max(Math.min(total || 1, 5), 1),
    xl: Math.max(Math.min(total || 1, 6), 1),
  };

  return (
    <Container size="xs" py="xl">
      <Stack gap="xl" align="center">
        {shortLink.heroImage && (
          <Box
            style={{
              width: '100%',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <img
              src={shortLink.heroImage}
              alt={`${shortLink.title} hero`}
              style={{ maxHeight: 320, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
            />
          </Box>
        )}

        <div style={{ textAlign: 'center', width: '100%' }}>
          <Title order={1} size="h1">
            {shortLink.title}
          </Title>
        </div>

        {total > 0 ? (
          <SimpleGrid w="100%" spacing="lg" cols={colsConfig}>
            {destinations.map((destination) => (
              <Card
                key={destination.id}
                padding="lg"
                radius={28}
                withBorder={false}
                component="a"
                href={destination.url}
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
                    {destination.image ? (
                      <img
                        src={destination.image}
                        alt={destination.title || 'Destination'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Text
                        fw={600}
                        c="dimmed"
                        style={{
                          padding: '0 8px',
                          fontSize: 'clamp(16px, 5vw, 26px)',
                          wordBreak: 'break-word',
                          textAlign: 'center',
                          lineHeight: 1.1,
                        }}
                      >
                        {destination.title || 'Untitled'}
                      </Text>
                    )}
                  </Box>
                  {destination.image && (
                    <Text fw={600} size="sm" ta="center">
                      {destination.title || 'Untitled'}
                    </Text>
                  )}
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed" ta="center">
            No destinations configured
          </Text>
        )}

      </Stack>
    </Container>
  );
}

