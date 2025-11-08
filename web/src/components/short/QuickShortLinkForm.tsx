'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconArrowRight, IconClipboard, IconLink } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SaveShortLinkResponse, SavedShortLink } from '@/lib/types';
import { saveShortLinkToStorage } from '@/lib/localStorage';

function generateSlug(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < length; i += 1) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export function QuickShortLinkForm() {
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const createShortLink = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Include http:// or https://');
      return;
    }

    setError(null);
    setSlug(null);
    setIsSaving(true);

    const editorToken = `quick-${generateSlug(12)}`;

    try {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const singleSlug = generateSlug(6);

        const response = await fetch('/api/short', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Quick link',
            slug: singleSlug,
            editorToken,
            destinations: [
              {
                id: `quick-${Date.now()}`,
                title: 'Destination',
                url: trimmed,
                position: 0,
              },
            ],
          }),
        });

        let data: SaveShortLinkResponse;
        try {
          data = (await response.json()) as SaveShortLinkResponse;
        } catch {
          data = { success: false, error: 'Unexpected server response.' };
        }

        if (response.ok && data.success && data.slug) {
          const editorTokenValue = data.editorToken ?? editorToken;
          const record: SavedShortLink = {
            id: data.id ?? editorTokenValue,
            title: 'Quick link',
            slug: data.slug,
            editorToken: editorTokenValue,
            editorUrl: `/short/edit/${editorTokenValue}`,
            createdAt: data.createdAt ?? new Date().toISOString(),
            origin,
            heroImage: undefined,
            destinations: [
              {
                id: `quick-${Date.now()}`,
                title: 'Destination',
                url: trimmed,
                position: 0,
              },
            ],
          };

          saveShortLinkToStorage(record);
          setSlug(data.slug);
          setUrl('');
          setError(null);
          notifications.show({
            title: 'Short link created',
            message: `${origin.replace(/\/$/, '')}/${data.slug}`,
            icon: <IconLink size={16} />,
          });
          setIsSaving(false);
          return;
        }

        const message = data.error || 'Failed to create short link.';
        const conflict = /slug already in use/i.test(message);
        if (!conflict || attempt === 4) {
          throw new Error(message);
        }
        // retry with a fresh slug
      }
    } catch (createError: unknown) {
      const message =
        createError instanceof Error ? createError.message : 'Unable to create short link.';
      setError(message);
      setSlug(null);
    } finally {
      setIsSaving(false);
    }
  }, [origin, url]);

  return (
    <Card padding="xl" radius={28} withBorder className="glass-panel">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={600}>Instant short link</Text>
            <Text size="sm" c="dimmed">
              Paste a URL and get a six-character slug instantly. Ideal for quick sharing.
            </Text>
          </div>
          <Button
            component={Link}
            href="/short/new"
            variant="subtle"
            rightSection={<IconArrowRight size={16} />}
          >
            Advanced mode
          </Button>
        </Group>

        <Group align="flex-end" gap="sm" wrap="wrap">
          <TextInput
            label="Destination URL"
            placeholder="https://"
            required
            value={url}
            onChange={(event) => {
              setUrl(event.currentTarget.value);
              setError(null);
            }}
            style={{ flexGrow: 1, minWidth: 220 }}
          />
          <Button
            size="md"
            onClick={createShortLink}
            loading={isSaving}
            leftSection={<IconLink size={16} />}
          >
            Shorten
          </Button>
        </Group>

        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/short/new"
            variant="subtle"
            size="xs"
            rightSection={<IconArrowRight size={14} />}
          >
            Advanced mode
          </Button>
        </Group>

        {error && (
          <Alert
            color="red"
            icon={<IconAlertCircle size={16} />}
            variant="light"
            title="Something went wrong"
          >
            {error}
          </Alert>
        )}

        {slug && (
          <YourShortLinkDisplay origin={origin} slug={slug} />
        )}
      </Stack>
    </Card>
  );
}

function YourShortLinkDisplay({ origin, slug }: { origin: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const value = `${origin.replace(/\/$/, '')}/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      notifications.show({
        title: 'Copied',
        message: value,
        icon: <IconLink size={16} />,
      });
    } catch (error) {
      console.error('[QuickShortLinkForm] Copy failed:', error);
      notifications.show({
        title: 'Copy failed',
        message: 'Try copying manually.',
        color: 'red',
      });
    }
  };

  return (
    <Box
      p="md"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text size="sm" c="dimmed">
            Your short link
          </Text>
          <Text fw={600} style={{ fontFamily: 'monospace' }}>
            {value}
          </Text>
        </div>
        <Button
          variant="light"
          size="sm"
          onClick={handleCopy}
          leftSection={<IconClipboard size={16} />}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </Group>
    </Box>
  );
}

