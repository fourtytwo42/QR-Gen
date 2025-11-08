import { NextRequest, NextResponse } from 'next/server';
import { getShortLinkBySlug } from '@/app/actions/short-actions';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const shortLink = await getShortLinkBySlug(slug);

  if (!shortLink) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
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
  return NextResponse.redirect(`${base}/${slug}`, { status: 302 });
}

