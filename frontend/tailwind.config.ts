import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern medical palette — driven by runtime CSS variables so the
        // active theme (set from the admin panel) can re-colour the whole
        // site. Fallback hex values reproduce the default "Clinical Blue"
        // look when no theme <style> is injected.
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',     // deep navy
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--color-ink-subtle) / <alpha-value>)',
        },
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',     // clean white
          warm: 'rgb(var(--color-paper-warm) / <alpha-value>)',   // very light sky tint
          cream: 'rgb(var(--color-paper-cream) / <alpha-value>)', // soft sky for hero/CTA bands
        },
        sky: {
          50: '#f0f5ff',
          100: '#e3edff',
          200: '#cadcff',
        },
        clinical: {
          DEFAULT: 'rgb(var(--color-clinical) / <alpha-value>)',     // vibrant primary blue
          dark: 'rgb(var(--color-clinical-dark) / <alpha-value>)',
          light: 'rgb(var(--color-clinical-light) / <alpha-value>)',
          tint: 'rgb(var(--color-clinical-tint) / <alpha-value>)',
          deep: 'rgb(var(--color-clinical-deep) / <alpha-value>)',   // deepest brand blue for footer/CTA
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',     // wellness cyan — complementary
          dark: 'rgb(var(--color-accent-dark) / <alpha-value>)',
          light: 'rgb(var(--color-accent-light) / <alpha-value>)',
        },
        // Pastel tints for service / feature cards
        tint: {
          rose: '#ffe4ec',
          peach: '#ffe6d4',
          mint: '#dcf5e8',
          lavender: '#e8e3ff',
          sky: '#dbeafe',
          butter: '#fff3c4',
        },
        coral: 'rgb(var(--color-coral) / <alpha-value>)',         // alerts / emergency
      },
      fontFamily: {
        display: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(1.75rem, 3.5vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['clamp(1.75rem, 3.5vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-in': 'slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};

export default config;
