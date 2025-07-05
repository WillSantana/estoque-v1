const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',         // <== Necessário para funcionar com @apply
        ring: 'var(--ring)',             // <== Necessário para funcionar com @apply
        input: 'var(--input)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
      },
      animation: {
        fade: 'fadeOut 1s ease-in-out',
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
