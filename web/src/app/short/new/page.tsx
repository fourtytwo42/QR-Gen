'use client';

import { Badge, Stack, Text, Title } from '@mantine/core';
import { SiteShell } from '@/components/layout/SiteShell';
import { ShortLinkWizard } from '@/components/short/ShortLinkWizard';
import { useEffect } from 'react';

export default function ShortLinkPage() {
  useEffect(() => {
    document.title = 'Create short link · QR-Gen Studio';
  }, []);
  return (
    <SiteShell>
      <Stack gap="lg">
        <div>
          <Badge variant="light" color="aurora.5" size="lg">
            Device-bound management
          </Badge>
          <Title order={1} mt="sm">
            Short links with analytics and zero login friction.
          </Title>
          <Text c="dimmed" maw={640}>
            Each short link is managed from the device that created it using a signed cookie. We hash IP + UA for
            analytics, enrich with GeoLite2 locally, and publish a CSV-ready ledger.
          </Text>
        </div>
        <ShortLinkWizard />
      </Stack>
    </SiteShell>
  );
}
