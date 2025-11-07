import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  GridCol,
  Group,
  List,
  ListItem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconBolt,
  IconChartArcs,
  IconDeviceAnalytics,
  IconLink,
  IconLock,
  IconQrcode,
  IconShieldLock,
  IconSparkles,
} from '@tabler/icons-react';
import { SiteShell } from '@/components/layout/SiteShell';

export const dynamic = 'force-dynamic';

const USE_CASES = [
  {
    title: 'Single-link redirect',
    description:
      'Instant 302 redirect with optional upgrade to 301 when you confirm the destination. Built for campaigns that change fast.',
    stats: '75ms avg edge TTFB',
  },
  {
    title: 'Multi-link experiences',
    description:
      'Auto-generated landing pages with branded gradients, hero art, and tappable cards optimized for thumb reach.',
    stats: 'Unlimited destinations',
  },
  {
    title: 'Short links with analytics',
    description:
      'Device-bound management plus geo + device analytics without ever storing raw IP addresses.',
    stats: 'Median creation time: 6s',
  },
];

const FEATURE_CARDS = [
  {
    title: 'Server authoritative QR',
    description:
      'EasyQRCodeJS renders SVG + PNG variants server-side so previews always match downloads. Sharp normalizes logos and enforces ECC.',
    icon: IconQrcode,
    details: ['Embedded logos with quiet-zone guardrails', 'Gradient foregrounds + dot modules'],
  },
  {
    title: 'Safety obsessed',
    description:
      'Malicious-link screening via Web Risk, manual blocklists, Argon2id editor locks, and hashed analytics identifiers.',
    icon: IconShieldLock,
    details: ['No public accounts to breach', 'Optional password per editor URL'],
  },
  {
    title: 'Operational clarity',
    description:
      'Runbooks for backups, key rotation, and incident response baked in. Cloudflare R2 stores exports while CDN keeps scans lightning fast.',
    icon: IconChartArcs,
    details: ['Cache-friendly public endpoints', 'Health checks + structured logs'],
  },
];

const FAQ = [
  {
    q: 'Do I need an account?',
    a: 'No. Every QR receives a private editor link plus optional password enforcement. Short links bind to the device that created them.',
  },
  {
    q: 'Can I trust the scans?',
    a: 'Yes. We hash IP + UA, enrich with GeoLite2 locally, and display unique + total scans with transparent sampling indicators.',
  },
  {
    q: 'How are logos handled?',
    a: 'All logos are normalized with Sharp, ECC automatically jumps to H, and we check minimum module sizes so every print is reliable.',
  },
];

const STEPS = [
  {
    label: 'Details',
    text: 'Title, slug, and destinations with on-type URL normalization.',
  },
  {
    label: 'Design',
    text: 'Gradient studio, module styles, logos, and WCAG contrast checks.',
  },
  {
    label: 'Publish',
    text: 'Regenerate SVG + PNG + PDF server-side and push to R2 in one click.',
  },
];

const HERO_STATS = [
  { label: 'SVG + PNG regenerated', value: '3 formats', annotation: 'SVG · PNG · PDF kit' },
  { label: 'Geo accuracy', value: '97% city match', annotation: 'GeoLite2 local' },
];

export default function HomePage() {
  return (
    <SiteShell>
      <Stack gap={60}>
        <Hero />
        <UseCases />
        <FeatureShowcase />
        <FlowOverview />
        <Faq />
      </Stack>
    </SiteShell>
  );
}

function Hero() {
  return (
    <Grid gutter="xl" align="center">
      <GridCol span={{ base: 12, md: 7 }}>
        <Stack gap="lg">
          <Badge
            variant="gradient"
            gradient={{ from: '#5DE0E6', to: '#004AAD', deg: 120 }}
            size="lg"
            w="fit-content"
          >
            Instant editors · Zero passwords to reset
          </Badge>
          <Title order={1}>
            Build unforgettable QR experiences with a studio that cares about every pixel.
          </Title>
          <Text size="lg" c="dimmed">
            Launch branded QR codes, landings, and short links in under two minutes. Server-side
            rendering guarantees previews match the downloadable artifact—no surprises when your
            campaign hits print.
          </Text>
          <Group>
            <Link href="/qr/new" style={{ textDecoration: 'none' }}>
              <Button size="lg" rightSection={<IconBolt size={18} />}>
                Start a QR
              </Button>
            </Link>
            <Link href="/short/new" style={{ textDecoration: 'none' }}>
              <Button
                size="lg"
                variant="outline"
                color="gray"
                rightSection={<IconLink size={18} />}
              >
                Create short link
              </Button>
            </Link>
          </Group>
          <Group gap="xl">
            {HERO_STATS.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </Group>
        </Stack>
      </GridCol>
      <GridCol span={{ base: 12, md: 5 }}>
        <Card padding="xl" radius={28} style={{ position: 'relative' }}>
          <Stack gap="lg">
            <Group justify="space-between">
              <Text fw={600}>Live scan telemetry</Text>
              <Badge color="aurora.4">Edge cached</Badge>
            </Group>
            <SimpleGrid cols={2} spacing="lg">
              <Stat label="Scans this week" value="18,204" annotation="+8.4%" />
              <Stat label="Avg TTFB" value="142 ms" annotation="p95" />
            </SimpleGrid>
            <Divider label="Destinations" labelPosition="left" />
            <Stack gap="md">
              {['Product launch', 'VIP registration', 'Short link fallback'].map((item, idx) => (
                <Group key={item} justify="space-between" align="center">
                  <Group gap="sm">
                    <ThemeIcon color="aurora.4" variant="light" radius="xl">
                      <IconSparkles size={16} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600}>{item}</Text>
                      <Text size="xs" c="dimmed">
                        {idx === 0 ? '302 redirect' : idx === 1 ? 'Landing grid' : 'Device-bound short link'}
                      </Text>
                    </div>
                  </Group>
                  <Badge variant="light" color="gray">
                    {idx === 0 ? 'single' : idx === 1 ? 'multi' : 'short'}
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Card>
      </GridCol>
    </Grid>
  );
}

function UseCases() {
  return (
    <Stack gap="md">
      <SectionHeading
        label="Canonical flows"
        title="One studio · three obsessively polished flows."
        description="Single redirects, multi-link landings, and short links share the same opinionated craft."
      />
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {USE_CASES.map((useCase) => (
          <Card key={useCase.title} className="glass-panel">
            <Stack gap="sm">
              <Text fw={600} size="lg">
                {useCase.title}
              </Text>
              <Text c="dimmed" size="sm">
                {useCase.description}
              </Text>
              <Badge color="aurora.4">{useCase.stats}</Badge>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function FeatureShowcase() {
  return (
    <Stack gap="md">
      <SectionHeading
        label="Principles"
        title="Server authoritative, mobile-first, security forward."
        description="Every detail references real standards—ISO/IEC 18004, DENSO guidance, Web Risk, GeoLite2."
      />
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {FEATURE_CARDS.map((card) => (
          <Card key={card.title} padding="xl">
            <ThemeIcon
              size={52}
              radius="xl"
              variant="gradient"
              gradient={{ from: '#7F7FD5', to: '#86A8E7', deg: 120 }}
            >
              <card.icon size={28} />
            </ThemeIcon>
            <Stack gap="xs" mt="md">
              <Text fw={600} size="lg">
                {card.title}
              </Text>
              <Text size="sm" c="dimmed">
                {card.description}
              </Text>
              <List
                spacing={4}
                size="sm"
                icon={
                  <ThemeIcon size={16} radius="xl" color="aurora.4">
                    <IconSparkles size={12} />
                  </ThemeIcon>
                }
              >
                {card.details.map((detail) => (
                  <ListItem key={detail}>{detail}</ListItem>
                ))}
              </List>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function FlowOverview() {
  return (
    <Card padding="xl" radius={32} withBorder style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <Grid gutter="xl">
        <GridCol span={{ base: 12, md: 6 }}>
          <SectionHeading
            label="Creation flow"
            title="Details → Design → Publish."
            description="Wizards are tuned for 360×780 mobile screens and tall monitors—thumb zones matter."
          />
          <Stack gap="xs" mt="lg">
            {STEPS.map((step, idx) => (
              <Group key={step.label} align="flex-start" gap="md">
                <ThemeIcon size={38} radius="xl" variant="light" color="aurora.4">
                  {idx + 1}
                </ThemeIcon>
                <div>
                  <Text fw={600}>{step.label}</Text>
                  <Text size="sm" c="dimmed">
                    {step.text}
                  </Text>
                </div>
              </Group>
            ))}
          </Stack>
        </GridCol>
        <GridCol span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            <Card padding="lg" radius={24}>
              <Group justify="space-between" align="flex-end">
                <div>
                  <Text fw={600}>Accessibility guardrails</Text>
                  <Text size="sm" c="dimmed">
                    WCAG-aware color pairing + focus choreography
                  </Text>
                </div>
                <Badge leftSection={<IconLock size={12} />}>ISO/IEC 18004</Badge>
              </Group>
              <Divider my="md" />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Quiet zone
                </Text>
                <Text fw={600}>≥ 4 modules</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Logos enforce ECC
                </Text>
                <Text fw={600}>Level H auto</Text>
              </Group>
            </Card>
            <Card padding="lg" radius={24}>
              <Group gap="md">
                <ThemeIcon
                  size={46}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: '#74EBD5', to: '#ACB6E5' }}
                >
                  <IconDeviceAnalytics size={28} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>Analytics at a glance</Text>
                  <Text size="sm" c="dimmed">
                    Country counts, device mix, top destinations. Export CSV anytime.
                  </Text>
                </div>
              </Group>
              <SimpleGrid mt="md" cols={3}>
                {['Mobile 68%', 'Desktop 22%', 'Tablet 10%'].map((item) => {
                  const [label, value] = item.split(' ');
                  return <Stat key={item} label={label} value={value} />;
                })}
              </SimpleGrid>
            </Card>
          </Stack>
        </GridCol>
      </Grid>
    </Card>
  );
}

function Faq() {
  return (
    <Stack gap="md">
      <SectionHeading
        label="Questions"
        title="Privacy-first and operations-ready from day zero."
        description="We only store hashed identifiers, run local GeoLite2 lookups, and publish our runbook."
      />
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <Text fw={600}>{item.q}</Text>
            <Text size="sm" c="dimmed" mt="sm">
              {item.a}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <Stack gap={4}>
      <Badge variant="light" color="aurora.5" size="sm" w="fit-content">
        {label}
      </Badge>
      <Title order={2}>{title}</Title>
      <Text size="sm" c="dimmed" maw={600}>
        {description}
      </Text>
    </Stack>
  );
}

function Stat({
  label,
  value,
  annotation,
}: {
  label: string;
  value: string;
  annotation?: string;
}) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 1 }}>
        {label}
      </Text>
      <Text fw={600} size="lg">
        {value}
      </Text>
      {annotation && (
        <Text size="xs" c="dimmed">
          {annotation}
        </Text>
      )}
    </Stack>
  );
}
