'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  GridCol,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconDownload, IconQrcode } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { EditorRecord } from '@/lib/types';

interface EditorDashboardProps {
  record: EditorRecord;
}

export function EditorDashboard({ record }: EditorDashboardProps) {
  const baseOrigin =
    record.origin ||
    (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
  const normalizedOrigin = baseOrigin.replace(/\/$/, '');

  return (
    <Stack gap="xl">
      <Group gap="sm">
        <ThemeIcon variant="light" color="aurora.4" radius="xl" size="lg">
          <IconQrcode size={18} />
        </ThemeIcon>
        <Stack gap={2}>
          <Text fw={600}>QR editor</Text>
          <Text size="sm" c="dimmed">
            Update destinations, design, and downloads. Share the editor link in your browser to collaborate.
          </Text>
        </Stack>
      </Group>

      <Grid gutter="xl" align="stretch">
        <GridCol span={{ base: 12, md: 5 }}>
          <Card radius={28} padding="xl">
            <Stack gap="md" align="center">
              {record.heroImage && (
                <Box
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 16,
                    padding: 16,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <img
                    src={record.heroImage}
                    alt="Landing page hero"
                    style={{ maxHeight: 220, width: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: 12 }}
                  />
                </Box>
              )}
              <div
                style={{
                  background: record.style.bgColor,
                  padding: 24,
                  borderRadius: 24,
                }}
              >
                <QRCode value={`${normalizedOrigin}/l/${record.slug}`} fgColor={record.style.fgColor} bgColor={record.style.bgColor} size={220} />
              </div>
              <Button leftSection={<IconDownload size={16} />} variant="light">
                Download assets
              </Button>
            </Stack>
          </Card>
        </GridCol>
        <GridCol span={{ base: 12, md: 7 }}>
          <Card radius={28} padding="xl">
            <Stack gap="lg">
              <Text fw={600} size="lg">
                {record.title || 'Untitled QR'}
              </Text>
              <Text size="sm" c="dimmed">
                Last published {new Date(record.lastPublishedAt).toLocaleString()}
              </Text>
              <SimpleGrid cols={2}>
                <Stat label="Total scans" value={record.analytics.totalScans.toLocaleString()} />
                <Stat label="Unique scans" value={record.analytics.uniqueScans.toLocaleString()} />
              </SimpleGrid>
              <Stack gap="xs">
                <Text size="sm" c="dimmed">
                  Top countries
                </Text>
                {record.analytics.topCountries.map((country) => (
                  <Group key={country.label} gap="sm">
                    <Text w={70}>{country.label}</Text>
                    <Progress
                      value={country.value}
                      w="60%"
                      color="aurora"
                      radius="xl"
                      aria-label={`${country.label} share`}
                    />
                    <Text size="sm">{country.value}%</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        </GridCol>
      </Grid>

      <Card radius={28} padding="xl">
        <Group justify="space-between" mb="md">
          <Text fw={600}>Destinations</Text>
          <Badge variant="light" color="aurora.4">
            {record.destinations.length} active
          </Badge>
        </Group>
        <Table highlightOnHover horizontalSpacing="md" verticalSpacing="md">
          <TableThead>
            <TableTr>
              <TableTh>Image</TableTh>
              <TableTh>Title</TableTh>
              <TableTh>URL</TableTh>
              <TableTh ta="right">Scans</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {record.destinations.map((destination) => (
              <TableTr key={destination.id}>
                <TableTd>
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.title}
                      style={{ display: 'block', height: 56, width: 'auto', maxWidth: 100, objectFit: 'contain', borderRadius: 12 }}
                    />
                  ) : (
                    <Text size="xs" c="dimmed">
                      —
                    </Text>
                  )}
                </TableTd>
                <TableTd>{destination.title}</TableTd>
                <TableTd>
                  <Text size="sm" c="dimmed">
                    {destination.url}
                  </Text>
                </TableTd>
                <TableTd ta="right">{destination.scans.toLocaleString()}</TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Card>
    </Stack>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="lg" radius={20}>
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <Text fw={600} size="xl">
          {value}
        </Text>
      </Stack>
    </Card>
  );
}
