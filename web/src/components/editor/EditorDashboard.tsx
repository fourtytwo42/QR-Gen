'use client';

import {
  Badge,
  Button,
  Card,
  Grid,
  GridCol,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconChartBar, IconDownload, IconLock, IconQrcode } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { EditorRecord } from '@/lib/types';

interface EditorDashboardProps {
  record: EditorRecord;
}

export function EditorDashboard({ record }: EditorDashboardProps) {
  return (
    <Stack gap="xl">
      <Grid gutter="xl" align="stretch">
        <GridCol span={{ base: 12, md: 5 }}>
          <Card radius={28} padding="xl">
            <Stack gap="md" align="center">
              <Badge color="aurora.4">Server authoritative preview</Badge>
              <div
                style={{
                  background: record.style.bgColor,
                  padding: 24,
                  borderRadius: 24,
                }}
              >
                <QRCode value={`https://qr-gen.studio/l/${record.slug}`} fgColor={record.style.fgColor} bgColor={record.style.bgColor} size={220} />
              </div>
              <Text size="sm" c="dimmed">
                Preview uses react-qr-code. Production artifact is rendered via EasyQRCodeJS-NodeJS + Sharp so the SVG, PNG, and PDF always match.
              </Text>
              <Button leftSection={<IconDownload size={16} />} variant="light">
                Download assets
              </Button>
            </Stack>
          </Card>
        </GridCol>
        <GridCol span={{ base: 12, md: 7 }}>
          <Card radius={28} padding="xl">
            <Stack gap="lg">
              <div>
                <Text fw={600}>{record.title}</Text>
                <Text size="sm" c="dimmed">
                  Editor slug: {record.slug} · Last published {new Date(record.lastPublishedAt).toLocaleString()}
                </Text>
              </div>
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

      <Grid gutter="xl">
        <GridCol span={{ base: 12, md: 7 }}>
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
                  <TableTh>Title</TableTh>
                  <TableTh>URL</TableTh>
                  <TableTh ta="right">Scans</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {record.destinations.map((destination) => (
                  <TableTr key={destination.id}>
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
        </GridCol>
        <GridCol span={{ base: 12, md: 5 }}>
          <Card radius={28} padding="xl">
            <Stack gap="md">
              <Group gap="sm">
                <ThemeIcon variant="gradient" gradient={{ from: '#5DE0E6', to: '#004AAD' }} radius="xl" size="lg">
                  <IconLock size={18} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Security</Text>
                  <Text size="sm" c="dimmed">
                    Argon2id password · rate limited editors
                  </Text>
                </div>
              </Group>
              <Switch
                label="Password protection"
                description="Argon2id hashing with per-record salt."
                checked={record.passwordProtected}
                onChange={() => undefined}
              />
              <Switch
                label="Editor analytics"
                description="Keep hashed IP to maintain unique scan counts."
                checked
                readOnly
              />
              <Button variant="outline" leftSection={<IconChartBar size={16} />}>
                Export CSV
              </Button>
            </Stack>
          </Card>
        </GridCol>
      </Grid>

      <Card radius={28} padding="xl">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600}>Governance & caching strategy</Text>
            <Text size="sm" c="dimmed">
              Cache-Control: public, max-age=300, stale-while-revalidate=60 for /l/ and /r/ endpoints.
            </Text>
          </div>
          <Button leftSection={<IconQrcode size={16} />} variant="light">
            Regenerate assets
          </Button>
        </Group>
        <Text size="sm" c="dimmed" mt="md">
          On publish we regenerate SVG source of truth, PNG derivatives (512 & 2048 px), and PDFKit spec sheets with cut-safe margins.
          Assets land in Cloudflare R2 and are invalidated at the CDN edge. Web Risk checks run on every save and blocked URLs are
          stored with source metadata.
        </Text>
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
