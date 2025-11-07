'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { getSavedQRs } from '@/lib/localStorage';

type Props = {
  params: { slug: string };
};

export default function QRRedirectPage({ params }: Props) {
  const { slug } = params;
  const router = useRouter();
  const [status, setStatus] = useState<string>('Scanning QR code...');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[QR Redirect] =============================');
    console.log('[QR Redirect] Looking for slug:', slug);
    console.log('[QR Redirect] Slug type:', typeof slug);
    console.log('[QR Redirect] Slug length:', slug?.length);

    // Find QR by slug in localStorage
    const savedQRs = getSavedQRs();
    console.log('[QR Redirect] Found', savedQRs.length, 'QRs in localStorage');
    console.log('[QR Redirect] All slugs:', savedQRs.map(qr => qr.slug));
    
    const qrData = savedQRs.find((qr) => qr.slug === slug);

    if (!qrData) {
      console.error('[QR Redirect] ❌ QR NOT FOUND!');
      console.error('[QR Redirect] Searched for:', slug);
      console.error('[QR Redirect] Available slugs:', savedQRs.map(qr => ({
        slug: qr.slug,
        title: qr.title,
        id: qr.id
      })));
      setStatus('QR code not found. Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    console.log('[QR Redirect] Found QR:', qrData);
    console.log('[QR Redirect] Mode:', qrData.mode);
    console.log('[QR Redirect] Destinations:', qrData.destinations);

    // Single mode: redirect to first destination
    if (qrData.mode === 'single' && qrData.destinations && qrData.destinations.length > 0) {
      const targetUrl = qrData.destinations[0].url;
      console.log('[QR Redirect] Single mode - redirecting to:', targetUrl);
      setStatus(`Redirecting to ${targetUrl}...`);
      window.location.href = targetUrl;
      return;
    }

    // Multi mode: redirect to landing page
    if (qrData.mode === 'multi' && qrData.destinations && qrData.destinations.length > 1) {
      console.log('[QR Redirect] Multi mode - redirecting to landing page');
      setStatus('Loading landing page...');
      router.push(`/lp/${slug}`);
      return;
    }

    // Fallback: if we have destinations but mode is unclear
    if (qrData.destinations && qrData.destinations.length > 0) {
      const targetUrl = qrData.destinations[0].url;
      console.log('[QR Redirect] Fallback - redirecting to first destination:', targetUrl);
      setStatus(`Redirecting...`);
      window.location.href = targetUrl;
      return;
    }

    // No valid destinations
    console.log('[QR Redirect] No valid destinations');
    setStatus('No destination configured');
    setTimeout(() => {
      router.push('/');
    }, 2000);
  }, [slug, router]);

  return (
    <Center style={{ minHeight: '100vh' }}>
      <Stack align="center" gap="lg">
        <Loader size="xl" />
        <Text size="lg" fw={500}>
          {status}
        </Text>
      </Stack>
    </Center>
  );
}

