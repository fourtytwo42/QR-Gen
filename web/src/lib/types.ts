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
  destinations: Destination[];
  heroImage?: string;
}

export interface SavedShortLink {
  id: string;
  title: string;
  slug: string;
  editorToken: string;
  editorUrl: string;
  createdAt: string;
  origin?: string;
  heroImage?: string;
  destinations: Destination[];
}

export interface SaveShortLinkResponse {
  success: boolean;
  id?: string;
  slug?: string;
  createdAt?: string;
  editorToken?: string;
  error?: string;
}

export interface AnalyticsSlice {
  label: string;
  value: number;
}

export interface EditorDestination extends Destination {
  scans: number;
}

export interface DestinationScanCount {
  destinationId: string;
  count: number;
}

export interface EditorAnalytics {
  totalScans: number;
  uniqueScans: number;
  topCountries: AnalyticsSlice[];
  devices: AnalyticsSlice[];
  destinationCounts?: DestinationScanCount[];
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
