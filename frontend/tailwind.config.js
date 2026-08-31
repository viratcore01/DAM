/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        damsafe: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e3a5f',
        },
        danger: {
          light: '#f8d7da',
          DEFAULT: '#dc3545',
          dark: '#c82333',
        },
        warning: {
          light: '#fff3cd',
          DEFAULT: '#ffc107',
          dark: '#e0a800',
        },
      },
    },
  },
  plugins: [],
};
