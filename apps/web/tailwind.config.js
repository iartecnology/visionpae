const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#0B6E4F',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          foreground: '#0F172A',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        accent: {
          DEFAULT: '#0891B2',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
    },
  },
  plugins: [],
};