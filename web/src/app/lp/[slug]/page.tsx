import { queryOne, query as dbQuery } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, Stack, Text, Button, Container, Title } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Multi-link landing page
 */
export default async function LandingPage({ params }: Props) {
  const { slug } = await params;

  // Fetch QR and destinations
  const qr = await queryOne<any>(
    `SELECT * FROM qr WHERE slug = $1 AND status = 'active'`,
    [slug]
  );

  if (!qr || qr.mode !== 'multi') {
    notFound();
  }

  const destinations = await dbQuery<any>(
    `SELECT * FROM qr_destination WHERE qr_id = $1 ORDER BY position`,
    [qr.id]
  );

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl" align="center">
        <div style={{ textAlign: 'center' }}>
          <Title order={1} size="h2">{qr.title}</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Select a destination below
          </Text>
        </div>

        <Stack gap="md" w="100%">
          {destinations.map((dest: any) => (
            <Card 
              key={dest.id} 
              padding="lg" 
              radius="md" 
              withBorder
              component="a"
              href={dest.url}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <Stack gap="xs">
                <Text fw={600} size="lg">{dest.title}</Text>
                <Text size="sm" c="dimmed" lineClamp={1}>{dest.url}</Text>
                <Button 
                  variant="light" 
                  rightSection={<IconExternalLink size={16} />}
                  fullWidth
                  mt="xs"
                >
                  Visit
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>

        <Text size="xs" c="dimmed" ta="center">
          Powered by QR-Gen Studio
        </Text>
      </Stack>
    </Container>
  );
}

