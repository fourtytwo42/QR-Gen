'use client';

import { useEffect, useState } from 'react';
import { ActionIcon, Badge, Box, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { getSavedShortLinks, removeShortLinkFromStorage } from '@/lib/localStorage';
import { SavedShortLink } from '@/lib/types';

const GRID_COLS = { base: 1, sm: 2, md: 3, lg: 4, xl: 5 };

function getInitialLinks(): SavedShortLink[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return getSavedShortLinks();
}

export function SavedShortLinksList() {
  const [links, setLinks] = useState<SavedShortLink[]>(getInitialLinks);
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      setLinks(getSavedShortLinks());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleRemove = (id: string) => {
    removeShortLinkFromStorage(id);
    setLinks(getSavedShortLinks());
  };

  if (links.length === 0) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Badge variant="light" color="aurora.4" size="lg">
            Your short links
          </Badge>
        </div>
      </Group>

      <SimpleGrid cols={GRID_COLS} spacing="lg">
        {links.map((link) => {
          const cardOrigin = (link.origin || origin).replace(/\/$/, '');
          const shortUrl = `${cardOrigin}/${link.slug}`;
          const destinations = link.destinations?.slice(0, 3) ?? [];

          return (
            <Card
              key={link.id}
              padding="md"
              radius="lg"
              withBorder
              shadow="sm"
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => window.location.assign(link.editorUrl)}
            >
              <ActionIcon
                variant="light"
                color="red"
                size="md"
                style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemove(link.id);
                }}
                aria-label="Delete short link"
              >
                <IconTrash size={14} />
              </ActionIcon>

              <Stack gap="md" align="center">
                <Box
                  style={{
                    width: '100%',
                    height: 140,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  {link.heroImage ? (
                    <img
                      src={link.heroImage}
                      alt={`${link.title} hero`}
                      style={{ maxHeight: 140, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Box
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #5DE0E6, #004AAD)',
                      }}
                    >
                      <Text fw={700} size="lg" c="white">
                        {shortUrl.replace(/^https?:\/\//, '')}
                      </Text>
                    </Box>
                  )}
                </Box>

                <Stack gap={4} align="center" w="100%">
                  <Text fw={600} size="sm" ta="center">
                    {link.title}
                  </Text>
                  <Text size="xs" c="dimmed" ta="center" style={{ fontFamily: 'monospace' }}>
                    {shortUrl}
                  </Text>
                </Stack>

                <SimpleGrid cols={{ base: 2, sm: destinations.length >= 3 ? 3 : destinations.length || 1 }} spacing="xs" w="100%">
                  {destinations.length > 0 ? (
                    destinations.map((dest) => (
                      <Stack key={dest.id} gap={4} align="center">
                        <Box
                          style={{
                            width: 'clamp(56px, 12vw, 90px)',
                            height: 'clamp(56px, 12vw, 90px)',
                            borderRadius: 20,
                            overflow: 'hidden',
                            display: 'grid',
                            placeItems: 'center',
                            background: 'rgba(255,255,255,0.04)',
                          }}
                        >
                          {dest.image ? (
                            <img
                              src={dest.image}
                              alt={dest.title || 'Destination'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Text
                              fw={600}
                              c="dimmed"
                              style={{
                                padding: '0 6px',
                                fontSize: 'clamp(12px, 3vw, 18px)',
                                wordBreak: 'break-word',
                                textAlign: 'center',
                                lineHeight: 1.1,
                              }}
                            >
                              {dest.title || 'Untitled'}
                            </Text>
                          )}
                        </Box>
                        <Text fw={600} size="xs" ta="center">
                          {dest.title || 'Untitled'}
                        </Text>
                      </Stack>
                    ))
                  ) : (
                    <Text size="xs" c="dimmed" ta="center">
                      No destinations yet
                    </Text>
                  )}
                </SimpleGrid>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

