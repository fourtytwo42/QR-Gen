'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  FileButton,
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import { Destination, SavedShortLink } from '@/lib/types';
import { saveShortLinkToStorage } from '@/lib/localStorage';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

type CreateShortLinkResponse = {
  success: boolean;
  id?: string;
  slug?: string;
  createdAt?: string;
  error?: string;
};

function createDestination(position: number): Destination {
  return {
    id: `short-dest-${Date.now()}-${Math.random()}`,
    title: '',
    url: '',
    position,
    image: undefined,
  };
}

function generateSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < length; i += 1) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

function generateEditorToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `short-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface ShortLinkWizardProps {
  initialRecord?: SavedShortLink;
  mode?: 'create' | 'edit';
}

export function ShortLinkWizard({ initialRecord, mode = 'create' }: ShortLinkWizardProps) {
  const isEdit = mode === 'edit';
  const [title, setTitle] = useState(initialRecord?.title ?? '');
  const [destinations, setDestinations] = useState<Destination[]>(
    initialRecord?.destinations?.length ? initialRecord.destinations : [createDestination(0)]
  );
  const [heroImage, setHeroImage] = useState<string | undefined>(initialRecord?.heroImage);
  const [origin, setOrigin] = useState<string>(() => {
    if (initialRecord?.origin) return initialRecord.origin;
    if (typeof window !== 'undefined') return window.location.origin;
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  });
  const [slug] = useState<string>(() => initialRecord?.slug ?? generateSlug());
  const [editorToken] = useState<string>(() => initialRecord?.editorToken ?? generateEditorToken());
  const [recordId, setRecordId] = useState<string>(
    () => initialRecord?.id ?? `short-${generateEditorToken()}`
  );
  const [createdAt, setCreatedAt] = useState<string>(
    initialRecord?.createdAt ?? new Date().toISOString()
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialRecord?.origin || typeof window === 'undefined') return;
    const frame = window.requestAnimationFrame(() => {
      setOrigin(window.location.origin);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialRecord?.origin]);

  const shortUrl = useMemo(() => {
    const base = origin.replace(/\/$/, '');
    return `${base}/${slug}`;
  }, [origin, slug]);

  const handleHeroImage = useCallback((file: File | null) => {
    if (!file) {
      setHeroImage(undefined);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      notifications.show({
        title: 'Image too large',
        message: 'Please choose an image under 10MB.',
        color: 'red',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setHeroImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDestinationImage = useCallback((destinationId: string, file: File | null) => {
    if (!file) {
      setDestinations((prev) =>
        prev.map((dest) => (dest.id === destinationId ? { ...dest, image: undefined } : dest))
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      notifications.show({
        title: 'Image too large',
        message: 'Please choose an image under 10MB.',
        color: 'red',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDestinations((prev) =>
        prev.map((dest) =>
          dest.id === destinationId ? { ...dest, image: reader.result as string } : dest
        )
      );
    };
    reader.readAsDataURL(file);
  }, []);

  const addDestination = useCallback(() => {
    setDestinations((prev) => [...prev, createDestination(prev.length)]);
  }, []);

  const removeDestination = useCallback((id: string) => {
    setDestinations((prev) => prev.filter((dest) => dest.id !== id).map((dest, index) => ({
      ...dest,
      position: index,
    })));
  }, []);

  const normalizedDestinations = useMemo(
    () =>
      destinations.map((dest, index) => ({
        ...dest,
        position: index,
        title: dest.title?.trim() || '',
        url: dest.url?.trim() || '',
      })),
    [destinations]
  );

  const validate = useCallback(() => {
    if (!title.trim()) {
      notifications.show({
        title: 'Add a title',
        message: 'Give this short link a title so you can find it later.',
        color: 'red',
      });
      return false;
    }

    if (!normalizedDestinations.length) {
      notifications.show({
        title: 'Add a destination',
        message: 'Include at least one destination before saving.',
        color: 'red',
      });
      return false;
    }

    if (normalizedDestinations.some((dest) => !dest.url)) {
      notifications.show({
        title: 'Destination missing URL',
        message: 'Every destination needs a URL.',
        color: 'red',
      });
      return false;
    }

    return true;
  }, [normalizedDestinations, title]);

  const persistToDatabase = useCallback(async (): Promise<SavedShortLink | null> => {
    setIsSaving(true);

    const payloadDestinations = normalizedDestinations.map((destination) => ({
      id: destination.id,
      title: destination.title,
      url: destination.url,
      position: destination.position,
      image: destination.image,
    }));

    try {
      const response = await fetch('/api/short', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug,
          editorToken,
          heroImage,
          origin,
          destinations: payloadDestinations,
        }),
      });

      let data: CreateShortLinkResponse;
      try {
        data = (await response.json()) as CreateShortLinkResponse;
      } catch {
        data = { success: false, error: 'Invalid server response.' };
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save short link.');
      }

      if (data.id) {
        setRecordId(data.id);
      }
      if (data.createdAt) {
        setCreatedAt(data.createdAt);
      }

      const record: SavedShortLink = {
        id: data.id ?? recordId,
        title: title.trim(),
        slug: data.slug ?? slug,
        editorToken,
        editorUrl: `/short/edit/${editorToken}`,
        createdAt: data.createdAt ?? createdAt,
        origin,
        heroImage,
        destinations: payloadDestinations,
      };

      saveShortLinkToStorage(record);
      return record;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to save short link.';
      console.error('[ShortLinkWizard] Save error:', error);
      notifications.show({
        title: 'Save failed',
        message,
        color: 'red',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    createdAt,
    editorToken,
    heroImage,
    normalizedDestinations,
    origin,
    recordId,
    slug,
    title,
  ]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    const record = await persistToDatabase();
    if (!record) return;

    const base = origin.replace(/\/$/, '');
    const successUrl = `${base}/${record.slug}`;

    notifications.show({
      title: isEdit ? 'Short link updated' : 'Short link saved',
      message: successUrl.replace(/^https?:\/\//, ''),
      icon: <IconCheck size={16} />,
    });

    if (!isEdit) {
      setTimeout(() => {
        window.location.assign(record.editorUrl);
      }, 1200);
    }
  }, [isEdit, origin, persistToDatabase, validate]);

  const effectiveMode = normalizedDestinations.length > 1 ? 'Landing Page' : 'Direct redirect';

  return (
    <Stack gap="xl">
      <Grid gutter="xl" align="stretch">
        {isEdit && (
          <GridCol span={{ base: 12, md: 5 }}>
            <Card radius={28} padding="xl" withBorder>
              <Stack gap="lg">
                <div>
                  <Text fw={600}>{title || 'Short link preview'}</Text>
                  <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
                    {shortUrl}
                  </Text>
                </div>

                {heroImage ? (
                  <Box
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      overflow: 'hidden',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <img
                      src={heroImage}
                      alt="Landing hero"
                      style={{ maxHeight: 220, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </Box>
                ) : (
                  <Box
                    style={{
                      width: '100%',
                      borderRadius: 16,
                      padding: 32,
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Text size="sm" c="dimmed">
                      Add a hero image to appear at the top of the landing page.
                    </Text>
                  </Box>
                )}

                <Badge variant="light" color={normalizedDestinations.length > 1 ? 'green' : 'blue'} size="lg">
                  {effectiveMode}
                </Badge>

                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Destinations preview
                  </Text>
                  <SimpleDestinationsPreview destinations={normalizedDestinations} />
                </Stack>
              </Stack>
            </Card>
          </GridCol>
        )}

        <GridCol span={{ base: 12, md: isEdit ? 7 : 12 }}>
          <Card radius={28} padding="xl" withBorder>
            <Stack gap="lg">
              <TextInput
                label="Title"
                placeholder="e.g. VIP Registration"
                required
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
              />

              <Stack gap="xs">
                <FileButton onChange={handleHeroImage} accept="image/png,image/jpeg,image/jpg,image/webp">
                  {(props) => (
                    <Button {...props} variant="light">
                      {heroImage ? 'Change landing page image' : 'Add landing page image'}
                    </Button>
                  )}
                </FileButton>
                {heroImage && (
                  <Button variant="subtle" color="red" size="xs" onClick={() => handleHeroImage(null)}>
                    Remove image
                  </Button>
                )}
                <Text size="xs" c="dimmed">
                  Appears above your destinations. 10MB max.
                </Text>
              </Stack>

              <Stack gap="md">
                {destinations.map((destination, index) => (
                  <Card key={destination.id} padding="md" radius="lg" withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between" align="center">
                        <Text fw={600}>Destination {index + 1}</Text>
                        {destinations.length > 1 && (
                          <Button
                            variant="subtle"
                            color="red"
                            size="xs"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => removeDestination(destination.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </Group>
                      <TextInput
                        label="Name"
                        placeholder="App Store"
                        maxLength={30}
                        value={destination.title}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setDestinations((prev) =>
                            prev.map((dest) => (dest.id === destination.id ? { ...dest, title: value } : dest))
                          );
                        }}
                      />
                      <Text size="xs" c="dimmed">
                        Names are capped at 30 characters and appear under the icon.
                      </Text>
                      <TextInput
                        label="URL"
                        placeholder="https://"
                        value={destination.url}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setDestinations((prev) =>
                            prev.map((dest) => (dest.id === destination.id ? { ...dest, url: value } : dest))
                          );
                        }}
                      />
                      <FileButton
                        onChange={(file) => handleDestinationImage(destination.id, file)}
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                      >
                        {(props) => (
                          <Button {...props} variant="light" size="xs">
                            {destination.image ? 'Change image' : 'Add image'}
                          </Button>
                        )}
                      </FileButton>
                      {destination.image && (
                        <Box
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <img
                            src={destination.image}
                            alt={destination.title}
                            style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                      )}
                    </Stack>
                  </Card>
                ))}
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addDestination}>
                  Add destination
                </Button>
              </Stack>

              <Group justify="flex-end">
                <Button onClick={handleSave} loading={isSaving}>
                  {isEdit ? 'Save changes' : 'Create short link'}
                </Button>
              </Group>
            </Stack>
          </Card>
        </GridCol>
      </Grid>
    </Stack>
  );
}

interface SimpleDestinationsPreviewProps {
  destinations: Destination[];
}

function SimpleDestinationsPreview({ destinations }: SimpleDestinationsPreviewProps) {
  if (!destinations.length) {
    return (
      <Text size="sm" c="dimmed">
        No destinations yet.
      </Text>
    );
  }

  return (
    <Group gap="sm" wrap="wrap">
      {destinations.slice(0, 4).map((dest) => (
        <Box
          key={dest.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            {dest.image ? (
              <img
                src={dest.image}
                alt={dest.title || 'Destination'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Text size="xs" fw={600} c="dimmed">
                {(dest.title || '—').slice(0, 2).toUpperCase()}
              </Text>
            )}
          </Box>
          <Text size="sm" fw={600}>
            {dest.title || 'Untitled'}
          </Text>
        </Box>
      ))}
    </Group>
  );
}
