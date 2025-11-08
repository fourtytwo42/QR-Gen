import { headers } from 'next/headers';
import { Button, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconLink } from '@tabler/icons-react';
import Link from 'next/link';
import { SiteShell } from '@/components/layout/SiteShell';
import { ShortLinkWizard } from '@/components/short/ShortLinkWizard';
import { SavedShortLink } from '@/lib/types';
import { getShortLinkByEditorToken } from '@/app/actions/short-actions';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EditShortLinkPage({ params }: Props) {
  const { token } = await params;
  const headersList = await headers();

  const proto =
    headersList.get('x-forwarded-proto') ||
    process.env.NEXT_PUBLIC_BASE_URL?.split('://')[0] ||
    'http';
  const host =
    headersList.get('host') ||
    process.env.NEXT_PUBLIC_BASE_URL?.split('://')[1] ||
    'localhost:3000';
  const fallbackOrigin = `${proto}://${host}`.replace(/\/$/, '');

  const record = await getShortLinkByEditorToken(token);

  let initialRecord: SavedShortLink | null = null;
  if (record) {
    initialRecord = {
      ...record,
      origin: record.origin ?? fallbackOrigin,
    };
  }

  return (
    <SiteShell>
      <Stack gap="xl">
        <Group gap="sm">
          <ThemeIcon variant="light" color="aurora.4" radius="xl" size="lg">
            <IconLink size={18} />
          </ThemeIcon>
          <div>
            <Title order={1}>Short link editor</Title>
            <Text c="dimmed" maw={640}>
              Adjust destinations, imagery, and names. Share the editor link in your browser bar to collaborate.
            </Text>
          </div>
        </Group>

        {!initialRecord && (
          <Stack gap="sm">
            <Text fw={600}>Short link not found</Text>
            <Text size="sm" c="dimmed">
              We couldn&apos;t find a record for this editor token. Create a new short link and save the editor URL.
            </Text>
            <Button component={Link} href="/short/new" variant="light">
              Create a short link
            </Button>
          </Stack>
        )}

        {initialRecord && <ShortLinkWizard initialRecord={initialRecord} mode="edit" />}
      </Stack>
    </SiteShell>
  );
}

