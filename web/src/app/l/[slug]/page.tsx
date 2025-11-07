import { Metadata } from 'next';
import { Badge, Container, Stack, Text } from '@mantine/core';
import { mockEditorRecord } from '@/lib/mockData';
import { LandingExperience } from '@/components/landing/LandingExperience';

type Props = {
  params: { slug: string };
};

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `QR Landing · ${params.slug}`,
  };
}

export default function LandingPage({ params }: Props) {
  const record = { ...mockEditorRecord, slug: params.slug };

  return (
    <Container size="lg" py="xl">
      <Stack gap="md" align="center">
        <Badge variant="light" color="aurora.5">
          Multi-link landing
        </Badge>
        <Text size="sm" c="dimmed">
          Tapping a card opens the destination in the same tab for lightning-fast flows.
        </Text>
      </Stack>
      <LandingExperience
        title={record.title}
        description="Auto-generated landing page with branded gradients and thumb-friendly cards."
        destinations={record.destinations}
      />
    </Container>
  );
}
