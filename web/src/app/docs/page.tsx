import { Metadata } from 'next';
import { Accordion, Badge, Card, Grid, List, Stack, Text, Title } from '@mantine/core';
import { docSections } from '@/lib/mockData';
import { SiteShell } from '@/components/layout/SiteShell';

export const metadata: Metadata = {
  title: 'Docs · QR-Gen Studio',
};

export default function DocsPage() {
  return (
    <SiteShell>
      <Stack gap="xl">
        <div>
          <Badge variant="light" color="aurora.4" size="lg">
            Documentation
          </Badge>
          <Title order={1} mt="sm">
            Clarity on design rules, safety, privacy, and operations.
          </Title>
          <Text c="dimmed" maw={720}>
            These docs mirror the runbook we follow in production: ISO/IEC 18004 quiet-zone guidance, Web Risk filters,
            GeoLite2 privacy treatment, and deployment steps for Ubuntu 24.04 + PostgreSQL 18 + Cloudflare R2.
          </Text>
        </div>

        <Grid gutter="xl">
          {docSections.map((section) => (
            <Grid.Col span={{ base: 12, md: 6 }} key={section.id}>
              <Card padding="xl" radius={28}>
                <Text fw={600}>{section.title}</Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {section.summary}
                </Text>
                <List mt="md" spacing="xs">
                  {section.bullet.map((item) => (
                    <List.Item key={item}>{item}</List.Item>
                  ))}
                </List>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Card padding="xl" radius={28}>
          <Title order={3}>Operational runbook (abridged)</Title>
          <Accordion mt="lg" variant="separated">
            <Accordion.Item value="backups">
              <Accordion.Control>Backups & recovery</Accordion.Control>
              <Accordion.Panel>
                Nightly physical backup of PostgreSQL base directory with WAL segments retained for seven days. Weekly logical export for portability and monthly test restore drills.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="keys">
              <Accordion.Control>Key rotation</Accordion.Control>
              <Accordion.Panel>
                Rotate Cloudflare R2 keys and Web Risk API credentials every 90 days. Track ownership in your vault and expire old keys immediately after validation.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="incidents">
              <Accordion.Control>Incident response</Accordion.Control>
              <Accordion.Panel>
                Elevated 5xx? Inspect app logs, DB connections, and R2 availability. Fraud report? Archive the QR/short link and blocklist the offending URL with a human-friendly reason.
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>
      </Stack>
    </SiteShell>
  );
}
