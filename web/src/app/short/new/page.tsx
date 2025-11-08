'use client';

import { Divider, Stack, Text, Title } from '@mantine/core';
import { SiteShell } from '@/components/layout/SiteShell';
import { ShortLinkWizard } from '@/components/short/ShortLinkWizard';
import { useEffect } from 'react';

export default function ShortLinkPage() {
  useEffect(() => {
    document.title = 'Create short link · QR-Gen Studio';
  }, []);
  return (
    <SiteShell>
      <Stack gap="xl">
        <Divider label="Create New Short Link" labelPosition="center" />
        <div>
          <Title order={1} mt="sm">
            Build your short link.
          </Title>
          <Text c="dimmed" maw={640}>
            Start with a single destination or add more for a landing page. You can return any time using the editor link we generate for you.
          </Text>
        </div>
        <ShortLinkWizard />
      </Stack>
    </SiteShell>
  );
}
