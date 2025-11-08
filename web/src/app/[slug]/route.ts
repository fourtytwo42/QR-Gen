import { NextRequest, NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { getShortLinkBySlug } from '@/app/actions/short-actions';

const RESERVED_SLUGS = new Set([
  '_next',
  'api',
  'qr',
  'short',
  'l',
  'lp',
  'slp',
  'favicon.ico',
]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const normalized = slug?.toLowerCase();

  if (!normalized || RESERVED_SLUGS.has(normalized)) {
    notFound();
  }

  const shortLink = await getShortLinkBySlug(normalized);

  if (!shortLink) {
    notFound();
  }

  if (shortLink.mode === 'multi' && shortLink.destinations.length > 1) {
    const forwardedHost =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('cf-connecting-host');
    const host = forwardedHost || request.headers.get('host');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const cfVisitor = request.headers.get('cf-visitor');
    let scheme = forwardedProto || new URL(request.url).protocol.replace(':', '');
    if (cfVisitor) {
      try {
        const parsed = JSON.parse(cfVisitor);
        if (parsed?.scheme) {
          scheme = parsed.scheme;
        }
      } catch {
        // ignore parse errors
      }
    }

    const base = host ? `${scheme || 'https'}://${host}` : new URL(request.url).origin;
    const landingUrl = `${base}/slp/${slug}`;
    return NextResponse.redirect(landingUrl, { status: 302 });
  }

  const targetUrl = shortLink.destinations[0]?.url ?? shortLink.targetUrl;

  if (!targetUrl) {
    notFound();
  }

  return NextResponse.redirect(targetUrl, { status: 302 });
}

