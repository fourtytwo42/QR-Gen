'use client';

import { Divider, Stack, Text, Title } from '@mantine/core';
import { SiteShell } from '@/components/layout/SiteShell';
import { QrWizard } from '@/components/qr/QrWizard';
import { useEffect, useState } from 'react';

interface Props {
  params: Promise<{ token: string }>;
}

export default function CreateQrPage({ params }: Props) {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    params.then(p => {
      setToken(p.token);
      document.title = 'Create QR · QR-Gen Studio';
    });
  }, [params]);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <SiteShell>
      <Stack gap="xl">
        <Divider label="Create New QR" labelPosition="center" />
        <div>
          <Title order={1} mt="sm">
            Build your QR code.
          </Title>
          <Text c="dimmed" maw={680}>
            Add one or more destinations, tweak the design, then publish when you’re happy. You can come back any time using the editor link we generate for you.
          </Text>
        </div>
        <QrWizard editorToken={token} />
      </Stack>
    </SiteShell>
  );
}

