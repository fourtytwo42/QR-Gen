import { NextRequest, NextResponse } from 'next/server';
import { getQRBySlug } from '@/app/actions/qr-actions';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  console.log('[l/[slug]] Handling redirect for slug:', slug);

  const qrData = await getQRBySlug(slug);

  if (!qrData) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  if (qrData.mode === 'multi' && qrData.destinations?.length > 1) {
    const landingUrl = new URL(`/lp/${slug}`, request.url);
    return NextResponse.redirect(landingUrl, { status: 302 });
  }

  const targetUrl = qrData.default_destination_url || qrData.destinations?.[0]?.url;
  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }

  return NextResponse.redirect(targetUrl, { status: 302 });
}

