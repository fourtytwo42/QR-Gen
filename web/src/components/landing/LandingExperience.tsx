import { Card, Grid, GridCol, Stack, Text, Title } from '@mantine/core';
import { EditorDestination } from '@/lib/types';

interface LandingExperienceProps {
  title: string;
  description: string;
  destinations: EditorDestination[];
}

export function LandingExperience({ title, description, destinations }: LandingExperienceProps) {
  return (
    <Stack gap="xl" py="xl">
      <Stack gap="xs" align="center" ta="center">
        <Title order={1}>{title}</Title>
        <Text c="dimmed" maw={520}>
          {description}
        </Text>
      </Stack>
      <Grid gutter="lg">
        {destinations.map((destination) => (
          <GridCol span={{ base: 12, sm: 6 }} key={destination.id}>
            <Card
              padding="xl"
              radius={28}
              component="a"
              href={destination.url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Stack gap="xs">
                <Text fw={600}>{destination.title}</Text>
                <Text size="sm" c="dimmed">
                  {destination.url}
                </Text>
              </Stack>
            </Card>
          </GridCol>
        ))}
      </Grid>
    </Stack>
  );
}
