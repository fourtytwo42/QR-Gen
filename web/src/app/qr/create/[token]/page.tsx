'use client';

import { Badge, Divider, Stack, Text, Title } from '@mantine/core';
import { SiteShell } from '@/components/layout/SiteShell';
import { QrWizard } from '@/components/qr/QrWizard';
import { SavedQRsList } from '@/components/qr/SavedQRsList';
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
        <SavedQRsList />
        
        <Divider label="Create New QR" labelPosition="center" />
        
        <div>
          <Badge variant="light" color="aurora.5" size="lg">
            Details → Design → Publish
          </Badge>
          <Title order={1} mt="sm">
            Create a branded QR with server-authoritative assets.
          </Title>
          <Text c="dimmed" maw={680}>
            Every save runs Web Risk screening, enforces ISO quiet zones, and bumps ECC to H when logos are present.
            Publishing regenerates SVG, PNG, and PDF via EasyQRCodeJS-NodeJS, Sharp, and PDFKit.
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Your unique editor token: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{token.slice(0, 20)}...</code>
          </Text>
        </div>
        <QrWizard editorToken={token} />
      </Stack>
    </SiteShell>
  );
}

