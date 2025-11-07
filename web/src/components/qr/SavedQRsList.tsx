'use client';

import { useEffect, useState } from 'react';
import { Badge, Box, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconExternalLink, IconTrash } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { getSavedQRs, removeQRFromStorage, SavedQR } from '@/lib/localStorage';
import Link from 'next/link';

export function SavedQRsList() {
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const refreshQRs = () => {
    const qrs = getSavedQRs();
    console.log('[SavedQRsList] Loaded QRs:', qrs.length);
    setSavedQRs(qrs);
  };

  useEffect(() => {
    // Load saved QRs on mount
    refreshQRs();
    
    // Refresh every 2 seconds to catch auto-saves
    const interval = setInterval(refreshQRs, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRemove = (id: string) => {
    console.log('[SavedQRsList] Removing QR:', id);
    removeQRFromStorage(id);
    refreshQRs();
  };

  if (savedQRs.length === 0) {
    return null;
  }

  return (
    <Stack gap="lg">
      <div>
        <Badge variant="light" color="aurora.4" size="lg">
          Your QR Codes
        </Badge>
        <Title order={2} mt="xs">
          Recently created
        </Title>
        <Text size="sm" c="dimmed">
          These are stored in your browser. Click any QR to open its editor.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {savedQRs.map((qr) => {
          const cardOrigin = (qr.origin || origin).replace(/\/$/, '');
          return (
          <Card key={qr.id} padding="lg" radius="lg" withBorder>
            <Stack gap="md">
              {qr.heroImage && (
                <Box
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <img
                    src={qr.heroImage}
                    alt={`${qr.title} hero`}
                    style={{ maxHeight: 160, width: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }}
                  />
                </Box>
              )}
              <Link href={qr.editorUrl} style={{ textDecoration: 'none' }}>
                <Box
                  style={{
                    background: qr.style.gradient 
                      ? `linear-gradient(135deg, ${qr.style.gradient[0]}, ${qr.style.gradient[1]})`
                      : qr.style.bgColor,
                    padding: 16,
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <QRCode
                    value={`${cardOrigin}/l/${qr.slug}`}
                    fgColor={qr.style.fgColor}
                    bgColor="transparent"
                    size={150}
                  />
                </Box>
              </Link>

              <div>
                <Text fw={600} size="sm" lineClamp={1}>
                  {qr.title}
                </Text>
                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                  {cardOrigin}/l/{qr.slug}
                </Text>
                <Text size="xs" c="dimmed">
                  {qr.mode === 'multi' ? `${qr.destinations?.length || 0} destinations` : '1 destination'}
                </Text>
                <Text size="xs" c="dimmed">
                  {new Date(qr.createdAt).toLocaleDateString()}
                </Text>
              </div>

              <Group gap="xs">
                <Button
                  component={Link}
                  href={qr.editorUrl}
                  variant="light"
                  size="xs"
                  fullWidth
                  rightSection={<IconExternalLink size={14} />}
                  style={{ textDecoration: 'none' }}
                >
                  Edit
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => handleRemove(qr.id)}
                >
                  <IconTrash size={14} />
                </Button>
              </Group>
            </Stack>
          </Card>
        );
        })}
      </SimpleGrid>
    </Stack>
  );
}

