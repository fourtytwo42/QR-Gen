'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  ColorInput,
  Divider,
  FileButton,
  Grid,
  GridCol,
  Group,
  NumberInput,
  rem,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { Stepper, StepperStep } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPlus, IconShieldLock, IconTrash, IconVocabulary } from '@tabler/icons-react';
import QRCode from 'react-qr-code';
import { Destination, QrMode, QrStyle, QrWizardValues } from '@/lib/types';
import { saveQRToStorage } from '@/lib/localStorage';

const MODULE_OPTIONS: QrStyle['moduleStyle'][] = ['square', 'rounded', 'dot'];
const EYE_STYLES: QrStyle['eyeStyle'][] = ['square', 'rounded'];

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

// Slider marks defined outside component to prevent re-creation
const SLIDER_MARKS: Array<{ value: number; label: string }> = [
  { value: 0.18, label: 'Safe' },
  { value: 0.28, label: 'Max print' },
];

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
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: 'initial-dest',
      title: 'Launch timeline',
      url: 'https://launch.qr-gen.studio/roadmap',
      position: 0,
      image: undefined,
    },
  ]);
  const [style, setStyle] = useState<QrStyle>(INITIAL_STYLE);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Handle logo file upload
  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setStyle((prev) => ({ ...prev, withLogo: true, ecc: 'H' }));
    } else {
      setLogoPreview(null);
      setStyle((prev) => ({ ...prev, withLogo: false, ecc: 'M' }));
    }
  };

  // Handle destination image upload
  const handleDestinationImage = (destId: string, file: File | null) => {
    if (file) {
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

  const form = useForm<QrWizardValues>({
    initialValues: {
      title: 'Product launch QR',
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

  const handleNext = () => setActive((current) => Math.min(current + 1, 2));
  const handleBack = () => setActive((current) => Math.max(current - 1, 0));

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
    // Use the actual domain in production, localhost for dev
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/l/${randomSlug}`;
  }, [randomSlug]);

  // Auto-save to localStorage so the preview QR works immediately
  useEffect(() => {
    console.log('[QrWizard] Auto-saving to localStorage...');
    
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
      style: {
        fgColor: style.fgColor,
        bgColor: style.bgColor,
        gradient: style.gradient,
      },
    };
    
    saveQRToStorage(qrData);
    console.log('[QrWizard] Auto-saved! Slug:', randomSlug, 'Mode:', effectiveMode);
  }, [destinations, form.values.title, style, effectiveMode, editorToken, randomSlug]);

  const publish = () => {
    const editorUrl = `/e/${editorToken}`;
    
    // Use the random slug generated on mount
    const qrSlug = randomSlug;
    
    console.log('[Publish] QR Slug:', qrSlug);
    console.log('[Publish] Editor Token:', editorToken);
    console.log('[Publish] QR URL will be:', `http://localhost:3000/l/${qrSlug}`);
    
    // Save to localStorage with destinations and mode
    saveQRToStorage({
      id: editorToken,
      title: form.values.title,
      slug: qrSlug,
      editorToken,
      editorUrl,
      mode: effectiveMode,
      destinations: destinations.map((dest) => ({
        id: dest.id,
        title: dest.title || '',
        url: dest.url || '',
        position: dest.position,
        image: dest.image,
      })),
      createdAt: new Date().toISOString(),
      style: {
        fgColor: style.fgColor,
        bgColor: style.bgColor,
        gradient: style.gradient,
      },
    });
    
    notifications.show({
      title: 'QR Code Published!',
      message: 'Bookmark your editor URL. Redirecting...',
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
            
            <Badge variant="light" color={effectiveMode === 'single' ? 'blue' : 'green'} size="lg">
              {effectiveMode === 'single' ? 'Direct Redirect (1 destination)' : `Landing Page (${destinations.length} destinations)`}
            </Badge>
            
            <Text size="sm" c="dimmed">
              {effectiveMode === 'single' 
                ? 'Scans will redirect directly to your destination (302)' 
                : 'Scans will show a landing page with all your destinations'}
            </Text>
            
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
                  <ColorInput label="Foreground" value={style.fgColor} onChange={(value) => setStyle((prev) => ({ ...prev, fgColor: value }))} />
                  <ColorInput label="Background" value={style.bgColor} onChange={(value) => setStyle((prev) => ({ ...prev, bgColor: value }))} />
                </Group>
                <Group grow>
                  <ColorInput
                    label="Gradient start"
                    value={style.gradient?.[0]}
                    onChange={(value) => setStyle((prev) => ({ ...prev, gradient: [value, prev.gradient?.[1] ?? value] }))}
                  />
                  <ColorInput
                    label="Gradient end"
                    value={style.gradient?.[1]}
                    onChange={(value) => setStyle((prev) => ({ ...prev, gradient: [prev.gradient?.[0] ?? value, value] }))}
                  />
                </Group>
                <Stack gap={4}>
                  <Text size="sm" fw={600}>
                    Module style
                  </Text>
                  <SegmentedControl
                  fullWidth
                  data={MODULE_OPTIONS.filter(Boolean).map((option) => ({ label: option, value: option }))}
                  value={style.moduleStyle || 'square'}
                  onChange={(value) => {
                    console.log('[SegmentedControl] onChange value:', value);
                    setStyle((prev) => ({ ...prev, moduleStyle: value as QrStyle['moduleStyle'] }));
                  }}
                  aria-label="Module style"
                />
                </Stack>
                <Stack gap={4}>
                  <Text size="sm" fw={600}>
                    Eye style
                  </Text>
                  <SegmentedControl
                  fullWidth
                  data={EYE_STYLES.filter(Boolean).map((option) => ({ label: option, value: option }))}
                  value={style.eyeStyle || 'square'}
                  onChange={(value) => {
                    console.log('[SegmentedControl Eye] onChange value:', value);
                    setStyle((prev) => ({ ...prev, eyeStyle: value as QrStyle['eyeStyle'] }));
                  }}
                  aria-label="Eye style"
                />
                </Stack>
                <NumberInput
                  label="Quiet zone (modules)"
                  value={style.quietZone}
                  onChange={(value) => setStyle((prev) => ({ ...prev, quietZone: Number(value) || 4 }))}
                  min={4}
                  max={20}
                />
                <Slider
                  label="Logo size"
                  value={style.logoSizeRatio || 0.22}
                  onChange={(value) => {
                    console.log('[Slider] onChange value:', value);
                    setStyle((prev) => ({ ...prev, logoSizeRatio: value }));
                  }}
                  min={0.15}
                  max={0.35}
                  step={0.01}
                  marks={SLIDER_MARKS}
                />
                <Switch
                  label="Embedded logo"
                  checked={style.withLogo}
                  onChange={(event) =>
                    setStyle((prev) => ({
                      ...prev,
                      withLogo: event.currentTarget.checked,
                      ecc: event.currentTarget.checked ? 'H' : 'M',
                    }))
                  }
                  description="We enforce ECC=H when a logo is present"
                />
                <Stack gap="xs">
                  <FileButton onChange={handleLogoUpload} accept="image/png,image/jpeg,image/svg+xml">
                    {(props) => <Button {...props} variant="light" fullWidth>
                      {logoFile ? 'Change Logo' : 'Upload Logo'}
                    </Button>}
                  </FileButton>
                  {logoFile && (
                    <Button variant="subtle" color="red" onClick={() => handleLogoUpload(null)} fullWidth>
                      Remove Logo
                    </Button>
                  )}
                </Stack>
                {style.withLogo && (
                  <Badge color="aurora.4" leftSection={<IconShieldLock size={12} />}>
                    ECC bumped to H for logo safety
                  </Badge>
                )}
                {logoPreview && (
                  <Box style={{ textAlign: 'center' }}>
                    <Text size="xs" c="dimmed" mb={4}>Logo preview:</Text>
                    <img src={logoPreview} alt="Logo" style={{ maxWidth: 80, maxHeight: 80 }} />
                  </Box>
                )}
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
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    border: `2px solid ${style.fgColor}20`,
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
                  {logoPreview && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        borderRadius: 8,
                        padding: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <img 
                        src={logoPreview} 
                        alt="Logo" 
                        style={{ 
                          width: 220 * style.logoSizeRatio, 
                          height: 220 * style.logoSizeRatio,
                          display: 'block',
                          borderRadius: 4,
                        }} 
                      />
                    </Box>
                  )}
                </Box>
                <Stack gap={4} w="100%">
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Module:</Text>
                    <Badge size="xs" variant="dot">{style.moduleStyle}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Eye:</Text>
                    <Badge size="xs" variant="dot">{style.eyeStyle}</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Quiet zone:</Text>
                    <Badge size="xs" variant="dot">{style.quietZone} modules</Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">ECC:</Text>
                    <Badge size="xs" variant="dot">{style.ecc}</Badge>
                  </Group>
                </Stack>
                <Text size="sm" c="dimmed" ta="center">
                  Client preview. Server renders final SVG/PNG with all styling via EasyQRCodeJS + Sharp.
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
          <Stack gap="lg">
            <Group justify="space-between">
              <div>
                <Text fw={600}>Final checks</Text>
                <Text size="sm" c="dimmed">
                  Web Risk screening, GeoLite2 enrichment, Argon2id password (optional)
                </Text>
              </div>
              <Badge leftSection={<IconVocabulary size={12} />}>R2 · PDFKit · Sharp</Badge>
            </Group>
            <Textarea
              label="Bookmark prompt"
              value="This is your private editor link. Save it now. Anyone with this link can edit."
              autosize
              minRows={2}
              readOnly
            />
            <Textarea
              label="Editor password (optional, Argon2id)"
              placeholder="********"
              {...form.getInputProps('password')}
            />
            <Text size="sm" c="dimmed">
              Publishing regenerates SVG (source of truth), PNG exports (512 & 2048 px), and PDF proof sheets with cut
              safe margins. Assets land in Cloudflare R2 and are cached via CDN.
            </Text>
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
