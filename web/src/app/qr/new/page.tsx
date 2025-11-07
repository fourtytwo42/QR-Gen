'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQrPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Generate unique token and redirect to creation page
    const uniqueToken = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    router.push(`/qr/create/${uniqueToken}`);
  }, [router]);
  
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Generating unique editor URL...</p>
    </div>
  );
}
