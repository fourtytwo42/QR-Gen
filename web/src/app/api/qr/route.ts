'use server';

import { NextResponse } from 'next/server';
import { createQR } from '@/app/actions/qr-actions';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const result = await createQR(payload);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to create QR' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[api/qr] Error saving QR:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

