export type QrMode = 'single' | 'multi';

export interface Destination {
  id: string;
  title: string;
  url: string;
  image?: string;
  position: number;
}

export interface QrStyle {
  fgColor: string;
  bgColor: string;
  gradient?: [string, string];
  moduleStyle: 'square' | 'rounded' | 'dot';
  eyeStyle: 'square' | 'rounded';
  quietZone: number;
  ecc: 'L' | 'M' | 'Q' | 'H';
  withLogo: boolean;
  logoSizeRatio: number;
}

export interface QrWizardValues {
  title: string;
  slug: string;
  mode: QrMode;
  defaultUrl: string;
  password?: string;
}

export interface ShortLinkConfig {
  title: string;
  slug: string;
  targetUrl: string;
  status: 'draft' | 'active';
  redirectCode: 301 | 302;
  customDomain?: string;
}

export interface AnalyticsSlice {
  label: string;
  value: number;
}

export interface EditorDestination extends Destination {
  scans: number;
}

export interface EditorAnalytics {
  totalScans: number;
  uniqueScans: number;
  topCountries: AnalyticsSlice[];
  devices: AnalyticsSlice[];
  destinations: EditorDestination[];
}

export interface EditorRecord {
  id: string;
  title: string;
  slug: string;
  mode: QrMode;
  passwordProtected: boolean;
  quietZone: number;
  ecc: 'L' | 'M' | 'Q' | 'H';
  destinations: EditorDestination[];
  style: QrStyle;
  analytics: EditorAnalytics;
  lastPublishedAt: string;
  bookmarkedHint?: string;
  heroImage?: string;
  origin?: string;
}
