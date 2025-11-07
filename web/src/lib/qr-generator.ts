import sharp from 'sharp';
import { QrStyle } from './types';
import QRCode from 'qrcode';

export interface QRGenerationOptions {
  text: string;
  style: QrStyle;
  logoPath?: string;
}

export interface QRGenerationResult {
  svg: string;
  png512: Buffer;
  png2048: Buffer;
}

/**
 * Generate QR code assets with styling
 */
export async function generateQRAssets(options: QRGenerationOptions): Promise<QRGenerationResult> {
  const { text, style, logoPath } = options;

  // Create SVG representation using qrcode library
  const svg = await generateQRSVG(text, style);
  
  // Generate PNG at 2048px
  const png2048 = await sharp(Buffer.from(svg))
    .resize(2048, 2048)
    .png()
    .toBuffer();
  
  // Generate PNG at 512px
  const png512 = await sharp(png2048)
    .resize(512, 512)
    .png()
    .toBuffer();

  return {
    svg,
    png512,
    png2048,
  };
}

/**
 * Generate SVG QR code
 */
async function generateQRSVG(text: string, style: QrStyle): Promise<string> {
  const svgString = await QRCode.toString(text, {
    type: 'svg',
    color: {
      dark: style.fgColor,
      light: style.bgColor,
    },
    errorCorrectionLevel: style.ecc,
    margin: style.quietZone,
    width: 2048,
  });
  
  return svgString;
}

/**
 * Map ECC level to QRCode library format
 */
function mapECCLevel(ecc: 'L' | 'M' | 'Q' | 'H'): number {
  const mapping: Record<string, number> = {
    L: 0,
    M: 1,
    Q: 2,
    H: 3,
  };
  return mapping[ecc] || 1;
}

/**
 * Process and normalize logo for QR embedding
 */
export async function processLogoForQR(logoBuffer: Buffer): Promise<Buffer> {
  return sharp(logoBuffer)
    .resize(400, 400, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();
}

/**
 * Validate QR color contrast for scanning reliability
 */
export function validateQRContrast(fgColor: string, bgColor: string): boolean {
  const fgLuminance = calculateLuminance(fgColor);
  const bgLuminance = calculateLuminance(bgColor);
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  // Minimum contrast ratio of 3:1 for QR codes
  return ratio >= 3;
}

/**
 * Calculate relative luminance of a color
 */
function calculateLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928 
      ? normalized / 12.92 
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

