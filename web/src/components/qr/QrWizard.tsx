'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  ColorInput,
  Divider,
  Grid,
  GridCol,
  Group,
  NumberInput,
  Radio,
  RadioGroup,
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
import { Destination, QrStyle, QrWizardValues } from '@/lib/types';

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

export function QrWizard() {
  const renderCount = useRef(0);
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
  
  // Track render count
  useEffect(() => {
    renderCount.current += 1;
    console.log('[QrWizard] Render #' + renderCount.current, '- Active:', active, 'Destinations:', destinations.length);
    if (renderCount.current > 5) {
      console.error('[QrWizard] RENDER LOOP DETECTED! Count:', renderCount.current);
    }
  });

  const form = useForm<QrWizardValues>({
    initialValues: {
      title: 'Product launch QR',
      slug: 'launch-week',
      mode: 'multi',
      defaultUrl: 'https://launch.qr-gen.studio/roadmap',
      password: '',
    },
    validate: {
      title: (value) => (!value ? 'Add a title so analytics stay readable.' : null),
      slug: (value) => (value.length < 4 ? 'Slug should be at least 4 characters.' : null),
      defaultUrl: (value) => (!value.startsWith('https://') ? 'Use https:// urls only.' : null),
    },
  });

  const addDestination = () => {
    const newDest = createDestination(destinations.length);
    console.log('[Add Destination] Creating new destination:', newDest);
    setDestinations((prev) => {
      console.log('[Add Destination] Previous destinations:', prev);
      const updated = [...prev, newDest];
      console.log('[Add Destination] Updated destinations:', updated);
      return updated;
    });
  };

  const removeDestination = (id: string) => {
    setDestinations((prev) => prev.filter((dest) => dest.id !== id));
  };

  const handleNext = () => setActive((current) => Math.min(current + 1, 2));
  const handleBack = () => setActive((current) => Math.max(current - 1, 0));

  const previewValue = useMemo(() => {
    const mode = form.values.mode;
    const defaultUrl = form.values.defaultUrl;
    const firstDestUrl = destinations[0]?.url;
    
    if (mode === 'single') {
      return defaultUrl || 'https://qrgen.link/demo';
    }

    return firstDestUrl || 'https://qrgen.link/demo';
  }, [form.values.mode, form.values.defaultUrl, destinations.length, destinations[0]?.url]);

  const publish = () => {
    notifications.show({
      title: 'Assets published',
      message: 'SVG, PNG (512 & 2048), and PDF kit stored in R2. Bookmark your editor URL.',
      icon: <IconCheck size={16} />,
    });
    setActive(0);
  };

  return (
    <Stack gap="xl">
      <Stepper active={active} onStepClick={setActive} size="sm">
        <StepperStep label="Details" description="Slug & destinations" />
        <StepperStep label="Design" description="Branding & contrast" />
        <StepperStep label="Publish" description="Exports & governance" />
      </Stepper>

      {active === 0 && (
        <Card radius={28} padding="xl">
          <Stack gap="lg">
            <TextInput label="Title" required {...form.getInputProps('title')} />
            <Group grow>
              <TextInput label="Slug" description="Base58 recommended" required {...form.getInputProps('slug')} />
              <TextInput
                label="Default destination"
                description="302 until you opt-in to 301"
                required
                {...form.getInputProps('defaultUrl')}
              />
            </Group>
            <RadioGroup label="Mode" {...form.getInputProps('mode')}>
              <Group mt="xs">
                <Radio value="single" label="Single-link (302 redirect)" />
                <Radio value="multi" label="Multi-link landing page" />
              </Group>
            </RadioGroup>
            {form.values.mode === 'multi' && (
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
                            console.log('[Title Change]', destination.id, '→', newValue);
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
                            console.log('[URL Change]', destination.id, '→', newValue);
                            setDestinations((prev) =>
                              prev.map((item) =>
                                item?.id === destination.id ? { ...item, url: newValue } : item
                              ).filter(Boolean)
                            );
                          }}
                        />
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
            )}
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
                {style.withLogo && (
                  <Badge color="aurora.4" leftSection={<IconShieldLock size={12} />}>
                    ECC bumped to H for logo safety
                  </Badge>
                )}
              </Stack>
            </Card>
          </GridCol>
          <GridCol span={{ base: 12, md: 5 }}>
            <Card radius={28} padding="xl">
              <Stack gap="lg" align="center">
                <Box
                  style={{
                    background: style.bgColor,
                    padding: rem(24),
                    borderRadius: 24,
                    width: '100%',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <QRCode value={previewValue} fgColor={style.fgColor} bgColor={style.bgColor} size={220} />
                </Box>
                <Text size="sm" c="dimmed">
                  Preview uses react-qr-code. Server-side assets are rendered with EasyQRCodeJS-NodeJS + Sharp.
                </Text>
              </Stack>
              <Divider my="lg" />
              <Text fw={600}>Accessibility</Text>
              <Text size="sm" c="dimmed">
                Color contrast and quiet zones are validated automatically. Gradients are tested against WCAG ratios
                and ISO/IEC 18004 minimums.
              </Text>
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
