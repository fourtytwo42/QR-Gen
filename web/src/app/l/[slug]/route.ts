import { NextRequest, NextResponse } from 'next/server';
import { getQRBySlug, recordQRScan } from '@/app/actions/qr-actions';

type RouteDestination = {
  id: string;
  title?: string;
  url: string;
  position: number;
  image?: string | null;
};

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  console.log('[l/[slug]] Handling redirect for slug:', slug);

  const qrData = await getQRBySlug(slug);

  if (!qrData) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  const destinations: RouteDestination[] = Array.isArray(qrData.destinations)
    ? (qrData.destinations as RouteDestination[])
    : [];
  const searchParams = request.nextUrl.searchParams;
  const destinationParam = searchParams.get('destination');

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null;
  const userAgent = request.headers.get('user-agent') || null;
  const country = request.headers.get('cf-ipcountry') || null;
  const referrer = request.headers.get('referer') || null;

  if (destinationParam) {
    const target = destinations.find((dest) => dest.id === destinationParam);
    if (!target) {
      return NextResponse.redirect(new URL(`/lp/${slug}`, request.url), { status: 302 });
    }

    await recordQRScan({
      qrId: qrData.id,
      slug,
      ip,
      userAgent,
      country,
      referrer,
      destinationId: target.id,
      destinationUrl: target.url,
      eventKind: 'destination',
    });

    return NextResponse.redirect(target.url, { status: 302 });
  }

  await recordQRScan({
    qrId: qrData.id,
    slug,
    ip,
    userAgent,
    country,
    referrer,
    destinationId: destinations.length === 1 ? destinations[0].id : null,
    destinationUrl: destinations.length === 1 ? destinations[0].url : null,
    eventKind: 'scan',
  });

  if (qrData.mode === 'multi' && destinations.length > 1) {
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
    const landingUrl = `${base}/lp/${slug}`;
    return NextResponse.redirect(landingUrl, { status: 302 });
  }

  const targetDestination = destinations[0];
  const targetUrl = qrData.default_destination_url || targetDestination?.url;
  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  if (targetDestination) {
    await recordQRScan({
      qrId: qrData.id,
      slug,
      ip,
      userAgent,
      country,
      referrer,
      destinationId: targetDestination.id,
      destinationUrl: targetUrl,
      eventKind: 'destination',
    });
  }

  return NextResponse.redirect(targetUrl, { status: 302 });
}

