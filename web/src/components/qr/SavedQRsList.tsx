'use client';

import { useEffect, useState } from 'react';
import { ActionIcon, Badge, Box, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconTrash } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { getSavedQRs, removeQRFromStorage, SavedQR } from '@/lib/localStorage';

const GRID_COLS = { base: 2, sm: 2, md: 3, lg: 4, xl: 6 };

export function SavedQRsList() {
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>(() => getSavedQRs());
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    // Refresh every 2 seconds to catch auto-saves
    const interval = setInterval(() => {
      const qrs = getSavedQRs();
      setSavedQRs(qrs);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRemove = (id: string) => {
    console.log('[SavedQRsList] Removing QR:', id);
    removeQRFromStorage(id);
    setSavedQRs(getSavedQRs());
    setCarouselIndices((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  if (savedQRs.length === 0) {
    return null;
  }

  const handleCarouselPrev = (id: string, length: number) => {
    setCarouselIndices((prev) => {
      const current = prev[id] ?? 0;
      return { ...prev, [id]: (current - 1 + length) % length };
    });
  };

  const handleCarouselNext = (id: string, length: number) => {
    setCarouselIndices((prev) => {
      const current = prev[id] ?? 0;
      return { ...prev, [id]: (current + 1) % length };
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Badge variant="light" color="aurora.4" size="lg">
            Your QR Codes
          </Badge>
        </div>
      </Group>
      <SimpleGrid cols={GRID_COLS} spacing="lg">
        {savedQRs.map((qr) => {
          const cardOrigin = (qr.origin || origin).replace(/\/$/, '');
          const destinations = qr.destinations?.slice(0, 2) || [];
          const carouselItems = [
            qr.heroImage ? { type: 'hero' as const, src: qr.heroImage } : null,
            { type: 'qr' as const, src: `${cardOrigin}/l/${qr.slug}` },
          ].filter(Boolean) as Array<{ type: 'hero' | 'qr'; src: string }>;
          const activeIndex = carouselIndices[qr.id] ?? 0;

          return (
            <Card
              key={qr.id}
              padding="md"
              radius="lg"
              withBorder
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => window.location.assign(qr.editorUrl)}
            >
              <ActionIcon
                variant="light"
                color="red"
                size="md"
                style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemove(qr.id);
                }}
                aria-label="Delete QR"
              >
                <IconTrash size={14} />
              </ActionIcon>

              <Stack gap="md" align="center" w="100%">
                <Card padding="xs" radius="lg" withBorder style={{ width: '100%', background: 'transparent', boxShadow: 'none', pointerEvents: 'none' }}>
                  <Stack gap="xs" align="center">
                    <Card.Section style={{ position: 'relative', width: '100%' }}>
                      {carouselItems.length > 1 && (
                        <Group justify="space-between" align="center" style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' }}>
                          <ActionIcon
                            variant="subtle"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCarouselPrev(qr.id, carouselItems.length);
                            }}
                            aria-label="Previous image"
                          >
                            <IconChevronLeft size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCarouselNext(qr.id, carouselItems.length);
                            }}
                            aria-label="Next image"
                          >
                            <IconChevronRight size={16} />
                          </ActionIcon>
                        </Group>
                      )}
                      <Box style={{ width: '100%', height: 140, display: 'grid', placeItems: 'center' }}>
                        {carouselItems[activeIndex]?.type === 'hero' ? (
                          <img
                            src={carouselItems[activeIndex]!.src}
                            alt={`${qr.title} hero`}
                            style={{ maxHeight: 140, width: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: 10 }}
                          />
                        ) : (
                          <Box
                            style={{
                              background: qr.style.gradient
                                ? `linear-gradient(135deg, ${qr.style.gradient[0]}, ${qr.style.gradient[1]})`
                                : qr.style.bgColor,
                              padding: 10,
                              borderRadius: 14,
                              display: 'grid',
                              placeItems: 'center',
                            }}
                          >
                            <QRCode value={`${cardOrigin}/l/${qr.slug}`} fgColor={qr.style.fgColor} bgColor="transparent" size={100} />
                          </Box>
                        )}
                      </Box>
                    </Card.Section>
                    <Text fw={600} size="sm" ta="center" style={{ pointerEvents: 'none' }}>
                      {qr.title}
                    </Text>
                  </Stack>
                </Card>

                <Stack gap="xs" align="center" w="100%">
                  {destinations.length > 0 ? (
                    <SimpleGrid w="100%" spacing="sm" cols={2}>
                      {destinations.map((dest) => (
                        <Stack key={dest.id} gap="xs" align="center">
                          <Box
                            style={{
                              width: 'clamp(56px, 14vw, 90px)',
                              height: 'clamp(56px, 14vw, 90px)',
                              borderRadius: 20,
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
                          {dest.image && (
                            <Text fw={600} size="xs" ta="center">
                              {dest.title || 'Untitled'}
                            </Text>
                          )}
                        </Stack>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text size="xs" c="dimmed">
                      No destinations yet
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

