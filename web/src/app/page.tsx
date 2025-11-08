import Link from 'next/link';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { SiteShell } from '@/components/layout/SiteShell';
import { SavedQRsList } from '@/components/qr/SavedQRsList';
import { SavedShortLinksList } from '@/components/short/SavedShortLinksList';
import { QuickShortLinkForm } from '@/components/short/QuickShortLinkForm';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <SiteShell>
      <Stack gap={48}>
        <Hero />
        <QuickShortLinkForm />
        <SavedCollections />
      </Stack>
    </SiteShell>
  );
}

function Hero() {
  return (
    <Stack gap="lg">
      <Title order={1} size="h1">
        Create QR codes and short links in seconds.
      </Title>
      <Text size="lg" c="dimmed" maw={720}>
        Use the QR builder to add destinations and styles, or drop a single URL into the instant short link widget below. No accounts or passwords required.
      </Text>
      <Group gap="md">
        <Link href="/qr/new" style={{ textDecoration: 'none' }}>
          <Button size="lg" rightSection={<IconArrowRight size={16} />}>
            Start a QR
          </Button>
        </Link>
      </Group>
    </Stack>
  );
}

function SavedCollections() {
  return (
    <Stack gap="xl">
      <SavedQRsList />
      <SavedShortLinksList />
    </Stack>
  );
}

