import { EditorRecord, EditorDestination } from './types';

const DESTINATIONS: EditorDestination[] = [
  {
    id: 'dest-1',
    title: 'Launch timeline',
    url: 'https://launch.qr-gen.studio/roadmap',
    image: undefined,
    position: 0,
    scans: 6824,
  },
  {
    id: 'dest-2',
    title: 'VIP registration',
    url: 'https://launch.qr-gen.studio/vip',
    image: undefined,
    position: 1,
    scans: 3120,
  },
  {
    id: 'dest-3',
    title: 'Fallback short link',
    url: 'https://qrgen.link/alpha',
    image: undefined,
    position: 2,
    scans: 987,
  },
];

export const mockEditorRecord: EditorRecord = {
  id: 'qr_mock',
  title: 'Launch Week QR',
  slug: 'launch-week',
  mode: 'multi',
  passwordProtected: true,
  quietZone: 4,
  ecc: 'H',
  destinations: DESTINATIONS,
  style: {
    fgColor: '#D6F3FF',
    bgColor: '#030712',
    gradient: ['#5DE0E6', '#004AAD'],
    moduleStyle: 'dot',
    eyeStyle: 'rounded',
    quietZone: 4,
    ecc: 'H',
    withLogo: true,
    logoSizeRatio: 0.25,
  },
  analytics: {
    totalScans: 18204,
    uniqueScans: 12118,
    topCountries: [
      { label: 'US', value: 62 },
      { label: 'DE', value: 14 },
      { label: 'JP', value: 9 },
      { label: 'BR', value: 6 },
      { label: 'AU', value: 5 },
    ],
    devices: [
      { label: 'Mobile', value: 68 },
      { label: 'Desktop', value: 22 },
      { label: 'Tablet', value: 10 },
    ],
    destinations: DESTINATIONS,
  },
  lastPublishedAt: '2025-11-05T14:32:00Z',
  bookmarkedHint: 'This is your private editor link. Save it now. Anyone with the link can edit.',
};

export function getMockEditorRecord(token: string): EditorRecord {
  // In real life we would fetch by token hash. Here we just enrich the mock.
  return {
    ...mockEditorRecord,
    slug: token.slice(0, 8),
    title: `Campaign · ${token.slice(0, 4).toUpperCase()}`,
  };
}

export const docSections = [
  {
    id: 'getting-started',
    title: 'Getting started',
    summary:
      'Create your first QR in under two minutes: Details → Design → Publish. Every step runs validation and Web Risk checks.',
    bullet: [
      'Choose single or multi mode. Multi mode provisions a landing page automatically.',
      'Bookmark the private editor link after publish; no login reset needed.',
      'Use “Send link to email” if you want a backup delivered to yourself.',
    ],
  },
  {
    id: 'design-rules',
    title: 'Design rules',
    summary:
      'We enforce ISO/IEC 18004 + DENSO guidance. Quiet zone ≥4 modules, ECC jumps to H when a logo is embedded, and WCAG color contrast is checked inline.',
    bullet: [
      'Logo uploads are centered and scaled via Sharp—minimum module size is enforced to keep scans reliable.',
      'Module styles: square, rounded, dot. Eye style: square or rounded to match your brand.',
      'Gradients blend two stops with live contrast evaluation to prevent unreadable prints.',
    ],
  },
  {
    id: 'safety',
    title: 'Safety',
    summary:
      'Every destination is screened with Google Web Risk before saving. Suspicious URLs can be manually blocklisted via Governance.',
    bullet: [
      'Editor passwords use Argon2id with per-record salt and sensible memory cost.',
      'Rate limiting is applied per IP and per editor token to reduce brute-force attempts.',
      'Short link management stays on-device with a signed cookie and never exposes raw tokens.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    summary:
      'IP addresses are treated as personal data. We hash them with salt before storage and only keep coarse GeoLite2 counters for analytics.',
    bullet: [
      'Analytics exports contain hashes and country/city plus device type.',
      'Geo lookups run locally with regularly updated MaxMind databases.',
      'Retention schedule: 13 months for aggregate metrics, 30 days for raw scan logs.',
    ],
  },
];
