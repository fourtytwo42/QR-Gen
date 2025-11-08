'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Anchor, Box, Container, Flex, Group, Paper, Text } from '@mantine/core';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'QR Generator', href: '/qr/new' },
  { label: 'Link Shortener', href: '/short/new' },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = useMemo(() => {
    return NAV_LINKS.find((link) => {
      if (link.href === '/') {
        return pathname === '/';
      }

      return pathname?.startsWith(link.href);
    })?.href;
  }, [pathname]);

  const renderNavLink = (link: (typeof NAV_LINKS)[number]) => (
    <Anchor
      key={link.href}
      component={Link}
      href={link.href}
      size="sm"
      fw={link.href === active ? 600 : 500}
      c={link.href === active ? 'white' : 'dimmed'}
      style={{
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      }}
      onClick={() => undefined}
    >
      {link.label}
    </Anchor>
  );

  return (
    <Box component="div" pt="md" pb="60px">
      <Container size="xl">
        <Paper
          className="glass-panel"
          p="lg"
          radius={24}
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Flex align="center" justify="space-between" gap="lg">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group gap="xs">
                <Box
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #5DE0E6 0%, #004AAD 100%)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                <Text fw={700} size="lg">
                  QR
                  </Text>
                </Box>
              <Text fw={600} size="lg">
                QR Maker
              </Text>
              </Group>
            </Link>

            <Group gap="lg" wrap="wrap" justify="flex-end">
              {NAV_LINKS.map(renderNavLink)}
            </Group>
          </Flex>
        </Paper>
      </Container>

      <Container size="xl" mt="lg">
        {children}
      </Container>
    </Box>
  );
}
