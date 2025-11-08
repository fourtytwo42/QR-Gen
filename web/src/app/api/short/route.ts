import { NextResponse } from 'next/server';
import { createShortLink } from '@/app/actions/short-actions';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (!payload?.editorToken || !payload?.slug || !payload?.title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
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
    const computedOrigin = host ? `${scheme || 'https'}://${host}` : undefined;

    let finalOrigin: string | undefined = payload.origin;
    if (!finalOrigin || /localhost|127\.0\.0\.1/.test(finalOrigin)) {
      finalOrigin = computedOrigin || finalOrigin;
    }

    const result = await createShortLink({
      title: payload.title,
      slug: payload.slug,
      editorToken: payload.editorToken,
      destinations: payload.destinations ?? [],
      heroImage: payload.heroImage,
      origin: finalOrigin,
    });

    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error('[api/short] Error:', error);
    return NextResponse.json({ success: false, error: 'Unexpected server error.' }, { status: 500 });
  }
}

