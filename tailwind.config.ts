import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#faf8f3',
        ink: '#2c2c2c',
        'ink-light': '#8b8b8b',
        accent: '#c97c5f',
        'accent-light': '#e8d5ca',
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
} satisfies Config;
