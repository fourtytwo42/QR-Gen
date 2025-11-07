'use client';

import { useState } from 'react';
import { Badge, Button, Card, Checkbox, Grid, GridCol, Group, SegmentedControl, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconLinkPlus } from '@tabler/icons-react';
import { ShortLinkConfig } from '@/lib/types';

export function ShortLinkWizard() {
  const [deviceLock, setDeviceLock] = useState(true);
  const form = useForm<ShortLinkConfig>({
    initialValues: {
      title: 'VIP Registration',
      slug: 'vip',
      targetUrl: 'https://launch.qr-gen.studio/vip',
      status: 'draft',
      redirectCode: 302,
      customDomain: 'qrgen.link',
    },
    validate: {
      targetUrl: (value) => (!value.startsWith('https://') ? 'Use https:// for redirects.' : null),
      slug: (value) => (value.length < 3 ? 'Slug needs at least 3 characters.' : null),
    },
  });

  const createShortLink = () => {
    notifications.show({
      title: 'Short link ready',
      message: `https://${form.values.customDomain}/${form.values.slug} is live with device-bound management.`,
      icon: <IconCheck size={14} />,
    });
  };

  return (
    <Grid gutter="xl">
      <GridCol span={{ base: 12, md: 7 }}>
        <Card padding="xl" radius={28}>
          <Stack gap="lg">
            <TextInput label="Internal title" {...form.getInputProps('title')} />
            <Group grow>
              <TextInput label="Custom domain" placeholder="qrgen.link" {...form.getInputProps('customDomain')} />
              <TextInput label="Slug" placeholder="launch" {...form.getInputProps('slug')} />
            </Group>
            <TextInput
              label="Destination URL"
              required
              placeholder="https://"
              {...form.getInputProps('targetUrl')}
            />
            <SegmentedControl
              fullWidth
              color="aurora"
              value={String(form.values.redirectCode)}
              onChange={(value) => form.setFieldValue('redirectCode', Number(value) as 301 | 302)}
              data={[
                { label: '302 · Flexible', value: '302' },
                { label: '301 · Permanent', value: '301' },
              ]}
            />
            <Switch
              label="Device-bound management"
              description="Keeps editor controls on the device that created this short link. Refreshing the signed cookie re-authenticates."
              checked={deviceLock}
              onChange={(event) => setDeviceLock(event.currentTarget.checked)}
            />
            <Group justify="space-between">
              <Button variant="default" component="a" href="/docs">
                View safety policy
              </Button>
              <Button onClick={createShortLink} rightSection={<IconLinkPlus size={16} />}>
                Create short link
              </Button>
            </Group>
          </Stack>
        </Card>
      </GridCol>
      <GridCol span={{ base: 12, md: 5 }}>
        <Card padding="xl" radius={28}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <div>
                <Text fw={600}>Management</Text>
                <Text size="sm" c="dimmed">
                  Signed cookie + Argon2id fallback
                </Text>
              </div>
              <Badge variant="light" color="aurora.4">
                99.9% uptime target
              </Badge>
            </Group>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Redirect status
              </Text>
              <Text fw={600}>{form.values.redirectCode}</Text>
            </Stack>
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Device bound
              </Text>
              <Text fw={600}>{deviceLock ? 'Enabled' : 'Disabled'}</Text>
            </Stack>
            <Checkbox
              checked
              label="Web Risk screen on save"
              description="Google Web Risk API ensures users cannot save malicious targets."
              readOnly
            />
            <Checkbox
              checked
              label="GeoLite2 enrichment"
              description="We only store hashed IP + Geo summary, never the raw address."
              readOnly
            />
          </Stack>
        </Card>
      </GridCol>
    </Grid>
  );
}
