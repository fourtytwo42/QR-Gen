'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import { getQRBySlug } from '@/app/actions/qr-actions';

type Props = {
  params: { slug: string };
};

export default function QRRedirectPage({ params }: Props) {
  const { slug } = params;
  const router = useRouter();
  const [status, setStatus] = useState<string>('Scanning QR code...');

  useEffect(() => {
    const handleRedirect = async () => {
      console.log('[QR Redirect] =============================');
      console.log('[QR Redirect] Looking for slug:', slug);

      // Fetch from PostgreSQL database
      const qrData = await getQRBySlug(slug);

      if (!qrData) {
        console.error('[QR Redirect] ❌ QR NOT FOUND in database!');
        setStatus('QR code not found. Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
        return;
      }

      console.log('[QR Redirect] ✅ Found QR in database:', qrData.title);
      console.log('[QR Redirect] Mode:', qrData.mode);
      console.log('[QR Redirect] Destinations:', qrData.destinations?.length);

      // Single mode: redirect to first destination (or default_destination_url)
      if (qrData.mode === 'single') {
        const targetUrl = qrData.default_destination_url || qrData.destinations?.[0]?.url;
        if (targetUrl) {
          console.log('[QR Redirect] Single mode - redirecting to:', targetUrl);
          setStatus(`Redirecting...`);
          window.location.href = targetUrl;
          return;
        }
      }

      // Multi mode: redirect to landing page
      if (qrData.mode === 'multi' && qrData.destinations && qrData.destinations.length > 1) {
        console.log('[QR Redirect] Multi mode - redirecting to landing page');
        setStatus('Loading landing page...');
        router.push(`/lp/${slug}`);
        return;
      }

      // Fallback
      const targetUrl = qrData.default_destination_url || qrData.destinations?.[0]?.url;
      if (targetUrl) {
        console.log('[QR Redirect] Fallback - redirecting to:', targetUrl);
        setStatus('Redirecting...');
        window.location.href = targetUrl;
        return;
      }

      // No valid destinations
      console.error('[QR Redirect] No valid destination URL');
      setStatus('No destination configured');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    };

    handleRedirect();
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

