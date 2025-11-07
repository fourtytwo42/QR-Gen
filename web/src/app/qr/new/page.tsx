'use client';

import { Badge, Divider, Stack, Text, Title } from '@mantine/core';
import { SiteShell } from '@/components/layout/SiteShell';
import { QrWizard } from '@/components/qr/QrWizard';
import { SavedQRsList } from '@/components/qr/SavedQRsList';
import { useEffect } from 'react';

export default function NewQrPage() {
  useEffect(() => {
    document.title = 'Create QR · QR-Gen Studio';
  }, []);
  return (
    <SiteShell>
      <Stack gap="xl">
        <SavedQRsList />
        
        {/* Divider only if there are saved QRs */}
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
        </div>
        <QrWizard />
      </Stack>
    </SiteShell>
  );
}
