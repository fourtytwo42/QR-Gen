'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ActionIcon,
  Anchor,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconArrowRight, IconBrandGithub } from '@tabler/icons-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'QR Generator', href: '/qr/new' },
  { label: 'Link Shortener', href: '/short/new' },
  { label: 'Docs', href: '/docs' },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);
  const isDesktop = useMediaQuery('(min-width: 62em)');

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
      onClick={close}
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
              <div>
                <Text fw={600} size="lg">
                  QR-Gen Studio
                </Text>
                <Text size="xs" c="dimmed">
                  Private editors • zero friction auth
                </Text>
              </div>
            </Group>

            {isDesktop ? (
              <Group gap="lg">
                {NAV_LINKS.map(renderNavLink)}
                <Divider orientation="vertical" color="rgba(255,255,255,0.15)" />
                <Group gap="xs">
                  <Link href="/qr/new" style={{ textDecoration: 'none' }}>
                    <Button rightSection={<IconArrowRight size={16} />}>
                      Launch Studio
                    </Button>
                  </Link>
                  <ActionIcon
                    component="a"
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    variant="subtle"
                    color="gray"
                    aria-label="GitHub"
                    size="lg"
                  >
                    <IconBrandGithub size={20} />
                  </ActionIcon>
                </Group>
              </Group>
            ) : (
              <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
            )}
          </Flex>

          {!isDesktop && opened && (
            <Stack gap="md" mt="lg" pt="md" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {NAV_LINKS.map(renderNavLink)}
              <Link href="/qr/new" style={{ textDecoration: 'none' }}>
                <Button rightSection={<IconArrowRight size={16} />} fullWidth>
                  Launch Studio
                </Button>
              </Link>
            </Stack>
          )}
        </Paper>
      </Container>

      <Container size="xl" mt="lg">
        {children}
      </Container>
    </Box>
  );
}
