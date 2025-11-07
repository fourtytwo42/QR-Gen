import { MantineColorsTuple, createTheme } from '@mantine/core';

const aurora: MantineColorsTuple = [
  '#f2f7ff',
  '#dbe8ff',
  '#b5d1ff',
  '#8ab6ff',
  '#649fff',
  '#4c92ff',
  '#3c8aff',
  '#2e75e2',
  '#2768c8',
  '#1a57ad',
];

const obsidian: MantineColorsTuple = [
  '#f2f4ff',
  '#d7dbf0',
  '#b6bddc',
  '#949ec8',
  '#7783b7',
  '#616fae',
  '#5565ab',
  '#464f8f',
  '#3d467f',
  '#343c70',
];

export const theme = createTheme({
  fontFamily: 'var(--font-body), "Space Grotesk", "Inter", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "Space Mono", monospace',
  headings: {
    fontFamily: 'var(--font-display), "Space Grotesk", "Inter", sans-serif',
    sizes: {
      h1: { fontSize: '3.2rem', fontWeight: '600', lineHeight: 1.1 },
      h2: { fontSize: '2.4rem', fontWeight: '600', lineHeight: 1.15 },
      h3: { fontSize: '1.8rem', fontWeight: '600', lineHeight: 1.2 },
    },
  },
  colors: {
    aurora,
    obsidian,
  },
  primaryColor: 'aurora',
  primaryShade: 4,
  defaultRadius: 'lg',
  shadows: {
    md: '0 30px 80px rgba(9, 14, 35, 0.55)',
    xl: '0 40px 120px rgba(9, 14, 35, 0.75)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
        size: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 24,
        padding: 'xl',
      },
      styles: {
        root: {
          backgroundColor: 'rgba(8, 14, 28, 0.8)',
          border: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: 'rgba(5, 9, 19, 0.85)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 24,
        },
      },
    },
  },
});
