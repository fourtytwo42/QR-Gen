'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  ColorInput,
  FileButton,
  Grid,
  GridCol,
  Group,
  rem,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { Stepper, StepperStep } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { Destination, QrMode, QrStyle, QrWizardValues } from '@/lib/types';
import { saveQRToStorage } from '@/lib/localStorage';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const INITIAL_STYLE: QrStyle = {
  fgColor: '#F6FBFE',
  bgColor: '#050912',
  gradient: ['#5DE0E6', '#004AAD'],
  moduleStyle: 'dot',
  eyeStyle: 'rounded',
  quietZone: 4,
  ecc: 'M',
  withLogo: true,
  logoSizeRatio: 0.22,
};

function createDestination(position: number): Destination {
  return {
    id: `dest-${Date.now()}-${Math.random()}`,
    title: '',
    url: '',
    position,
    image: undefined,
  };
}

interface QrWizardProps {
  editorToken: string;
}

export function QrWizard({ editorToken }: QrWizardProps) {
  const [active, setActive] = useState(0);
  const [destinations, setDestinations] = useState<Destination[]>([createDestination(0)]);
  const [style, setStyle] = useState<QrStyle>(INITIAL_STYLE);
  const [heroImage, setHeroImage] = useState<string | null>(null);
const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const [origin, setOrigin] = useState<string>(defaultOrigin);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raf = window.requestAnimationFrame(() => {
      setOrigin(window.location.origin);
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  // Handle destination image upload
  const handleDestinationImage = (destId: string, file: File | null) => {
    if (file) {
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
          prev.map((item) =>
            item?.id === destId ? { ...item, image: reader.result as string } : item
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (file: File | null) => {
    if (!file) {
      setHeroImage(null);
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
  };

  const form = useForm<QrWizardValues>({
    initialValues: {
      title: '',
      slug: '', // Auto-generated
      mode: 'single', // Auto-determined
      defaultUrl: '',
      password: '',
    },
    validate: {
      title: (value) => (!value ? 'Add a title so analytics stay readable.' : null),
    },
  });
  
  // Auto-determine mode based on number of destinations
  const effectiveMode: QrMode = destinations.length > 1 ? 'multi' : 'single';

  const addDestination = useCallback(() => {
    const newDest = createDestination(destinations.length);
    console.log('[Add Destination]', newDest.id);
    setDestinations((prev) => [...prev, newDest]);
  }, [destinations.length]);

  const removeDestination = useCallback((id: string) => {
    console.log('[Remove Destination]', id);
    setDestinations((prev) => prev.filter((dest) => dest.id !== id));
  }, []);

  // Generate random alphanumeric slug (10 characters)
  const [randomSlug] = useState(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  });

  // QR code should point to our redirect endpoint with random slug
  const previewValue = useMemo(() => {
    const base = origin.replace(/\/$/, '');
    return `${base}/l/${randomSlug}`;
  }, [origin, randomSlug]);

  const saveToDatabase = useCallback(async () => {
    console.log('[QrWizard] ===== SAVING TO DATABASE =====');
    console.log('[QrWizard] Random Slug:', randomSlug);
    console.log('[QrWizard] Editor Token:', editorToken);
    console.log('[QrWizard] Mode:', effectiveMode);
    console.log('[QrWizard] Destinations count:', destinations.length);
    
    const qrData = {
      id: editorToken,
      title: form.values.title,
      slug: randomSlug,
      editorToken,
      editorUrl: `/e/${editorToken}`,
      mode: effectiveMode,
      destinations: destinations.map((dest) => ({
        id: dest.id,
        title: dest.title || '',
        url: dest.url || '',
        position: dest.position,
        image: dest.image,
      })),
      createdAt: new Date().toISOString(),
      origin,
      heroImage: heroImage || undefined,
      style: {
        fgColor: style.fgColor,
        bgColor: style.bgColor,
        gradient: style.gradient,
        moduleStyle: style.moduleStyle,
        eyeStyle: style.eyeStyle,
        quietZone: style.quietZone,
        ecc: style.ecc,
        withLogo: style.withLogo,
        logoSizeRatio: style.logoSizeRatio,
      },
    };
    
    // Save to localStorage (for UI display in browser)
    saveQRToStorage(qrData);
    console.log('[QrWizard] ✅ Saved to localStorage!');
    
    // Save to PostgreSQL database (for cross-device persistence)
    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.values.title,
          slug: randomSlug,
          editorToken,
          mode: effectiveMode,
          destinations: qrData.destinations,
          style: qrData.style,
          password: form.values.password || undefined,
          origin,
          heroImage: heroImage || undefined,
        }),
      });

      if (response.ok) {
        console.log('[QrWizard] ✅ Saved to PostgreSQL database!');
        console.log('[QrWizard] QR URL:', `${origin.replace(/\/$/, '')}/l/${randomSlug}`);
      } else {
        const error = await response.json();
        console.error('[QrWizard] ❌ Database save failed:', error);
        notifications.show({
          title: 'Warning',
          message: 'Saved locally but database save failed. QR may not work from other devices.',
          color: 'yellow',
        });
      }
    } catch (dbError) {
      console.error('[QrWizard] ❌ Database error:', dbError);
    }
  }, [editorToken, form.values.title, form.values.password, randomSlug, effectiveMode, destinations, style, heroImage, origin]);

  const handleNext = async () => {
    // Save to database when moving from step 0 (Destinations) to step 1 (Design)
    if (active === 0) {
      await saveToDatabase();
    }
    setActive((current) => Math.min(current + 1, 2));
  };
  
  const handleBack = () => setActive((current) => Math.max(current - 1, 0));

  // Already saved when clicking "Continue to design" - no need for extra save here

  const publish = async () => {
    const editorUrl = `/e/${editorToken}`;
    
    console.log('[Publish] Starting final publish...');
    
    // Save to database (this also saves to localStorage)
    await saveToDatabase();
    
    notifications.show({
      title: 'QR Code Published!',
      message: 'Saved to database. Redirecting to editor...',
      icon: <IconCheck size={16} />,
      autoClose: 3000,
    });
    
    // Redirect to editor using the same token
    setTimeout(() => {
      window.location.href = editorUrl;
    }, 1500);
  };

  return (
    <Stack gap="xl">
      <Stepper active={active} onStepClick={setActive} size="sm">
        <StepperStep label="Destinations" description="Add URLs to link" />
        <StepperStep label="Design" description="Branding & contrast" />
        <StepperStep label="Publish" description="Exports & governance" />
      </Stepper>

      {active === 0 && (
        <Card radius={28} padding="xl">
          <Stack gap="lg">
            <TextInput label="Title" required {...form.getInputProps('title')} />
            
            <Stack gap="xs">
              <FileButton onChange={handleHeroImageUpload} accept="image/png,image/jpeg,image/jpg,image/webp">
                {(props) => (
                  <Button {...props} variant="light">
                    {heroImage ? 'Change landing page image' : 'Add landing page image'}
                  </Button>
                )}
              </FileButton>
              {heroImage && (
                <>
                  <Box
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <img
                      src={heroImage}
                      alt="Landing page hero"
                      style={{
                        maxHeight: 200,
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: 10,
                      }}
                    />
                  </Box>
                  <Button variant="subtle" color="red" size="xs" onClick={() => handleHeroImageUpload(null)}>
                    Remove landing page image
                  </Button>
                </>
              )}
              <Text size="xs" c="dimmed">
                This image appears above your destinations on the landing page.
              </Text>
            </Stack>

            <Stack gap="md">
                {destinations.map((destination, index) => {
                  if (!destination) {
                    console.error('[Destinations Map] NULL DESTINATION at index:', index);
                    return null;
                  }
                  return (
                  <Card key={destination.id} padding="md" radius="lg">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap="xs" flex={1}>
                        <TextInput
                          label={`Destination ${index + 1}`}
                          placeholder="Title"
                          maxLength={30}
                          value={destination.title || ''}
                          onChange={(event) => {
                            const newValue = event.currentTarget.value;
                            setDestinations((prev) =>
                              prev.map((item) =>
                                item?.id === destination.id ? { ...item, title: newValue } : item
                              ).filter(Boolean)
                            );
                          }}
                        />
                        <Text size="xs" c="dimmed">
                          Destination names are limited to 30 characters.
                        </Text>
                        <TextInput
                          label="URL"
                          placeholder="https://"
                          value={destination.url || ''}
                          onChange={(event) => {
                            const newValue = event.currentTarget.value;
                            setDestinations((prev) =>
                              prev.map((item) =>
                                item?.id === destination.id ? { ...item, url: newValue } : item
                              ).filter(Boolean)
                            );
                          }}
                        />
                        <FileButton 
                          onChange={(file) => handleDestinationImage(destination.id, file)} 
                          accept="image/png,image/jpeg,image/jpg"
                        >
                          {(props) => (
                            <Button {...props} variant="light" size="xs" fullWidth>
                              {destination.image ? 'Change Image' : 'Add Image (optional)'}
                            </Button>
                          )}
                        </FileButton>
                        {destination.image && (
                          <Box style={{ textAlign: 'center', marginTop: 8 }}>
                            <img 
                              src={destination.image} 
                              alt={destination.title} 
                              style={{ maxWidth: 100, maxHeight: 100, borderRadius: 8 }} 
                            />
                          </Box>
                        )}
                      </Stack>
                      {destinations.length > 1 && (
                        <Button
                          variant="subtle"
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => removeDestination(destination.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </Group>
                  </Card>
                  );
                }).filter(Boolean)}
              <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addDestination}>
                Add destination
              </Button>
            </Stack>
            <Group justify="space-between">
              <Button variant="default" onClick={handleBack} disabled={active === 0}>
                Back
              </Button>
              <Button onClick={handleNext}>Continue to design</Button>
            </Group>
          </Stack>
        </Card>
      )}

      {active === 1 && (
        <Grid gutter="xl">
          <GridCol span={{ base: 12, md: 7 }}>
            <Card radius={28} padding="xl">
              <Stack gap="lg">
                <Group grow>
                  <ColorInput
                    label="Foreground"
                    value={style.fgColor}
                    onChange={(value) => setStyle((prev) => ({ ...prev, fgColor: value }))}
                  />
                  <ColorInput
                    label="Background"
                    value={style.bgColor}
                    onChange={(value) => setStyle((prev) => ({ ...prev, bgColor: value }))}
                  />
                </Group>
                <Group grow>
                  <ColorInput
                    label="Gradient start"
                    value={style.gradient?.[0]}
                    onChange={(value) =>
                      setStyle((prev) => ({ ...prev, gradient: [value, prev.gradient?.[1] ?? value] }))
                    }
                  />
                  <ColorInput
                    label="Gradient end"
                    value={style.gradient?.[1]}
                    onChange={(value) =>
                      setStyle((prev) => ({ ...prev, gradient: [prev.gradient?.[0] ?? value, value] }))
                    }
                  />
                </Group>
                <Text size="sm" c="dimmed">
                  Adjust the foreground, background, and optional gradient to match your brand.
                </Text>
              </Stack>
            </Card>
          </GridCol>
          <GridCol span={{ base: 12, md: 5 }}>
            <Card radius={28} padding="xl">
              <Stack gap="lg" align="center">
                <Group gap="xs">
                  <Badge size="lg" variant="dot" color="green">
                    LIVE
                  </Badge>
                  <Text size="sm" fw={500}>Scan this QR now!</Text>
                </Group>
                <Text size="xs" c="dimmed" ta="center" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {previewValue}
                </Text>
                  <Box
                    key={`${style.fgColor}-${style.bgColor}-${style.gradient?.[0]}-${style.quietZone}`}
                    style={{
                      background: style.gradient
                        ? `linear-gradient(135deg, ${style.gradient[0]}, ${style.gradient[1]})`
                        : style.bgColor,
                      padding: rem(style.quietZone * 4),
                      borderRadius: 24,
                      width: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      border: `2px solid ${style.fgColor}20`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                  <Box
                    style={{
                      background: style.bgColor,
                      padding: 8,
                      borderRadius: 12,
                    }}
                  >
                    <QRCode 
                      value={previewValue} 
                      fgColor={style.fgColor} 
                      bgColor="transparent"
                      size={220}
                      level={style.ecc === 'L' ? 'L' : style.ecc === 'M' ? 'M' : style.ecc === 'Q' ? 'Q' : 'H'}
                    />
                  </Box>
                </Box>

                <Text size="sm" c="dimmed" ta="center">
                  The preview updates instantly with your color changes.
                </Text>
              </Stack>
            </Card>
          </GridCol>
          <GridCol span={12}>
            <Group justify="space-between">
              <Button variant="default" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>Continue to publish</Button>
            </Group>
          </GridCol>
        </Grid>
      )}

      {active === 2 && (
        <Card padding="xl" radius={28}>
          <Stack gap="md">
            <Text fw={600}>Publish</Text>
            <Text size="sm" c="dimmed">
              Optional: set a password to protect this editor link.
            </Text>
            <TextInput
              label="Editor password (optional)"
              placeholder="Leave blank to skip"
              type="password"
              {...form.getInputProps('password')}
            />
            <Group justify="space-between">
              <Button variant="default" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={publish} rightSection={<IconCheck size={16} />}>
                Publish assets
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
