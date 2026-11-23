/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#042B4F',
        brand: {
          DEFAULT: '#042B4F',
          50: '#EEF5FB',
          100: '#D6E6F5',
          200: '#ADCDEC',
          300: '#7CAEE0',
          400: '#4689CE',
          500: '#0A467D',
          600: '#042B4F',
          700: '#03223F',
          800: '#02192F',
          900: '#011020',
        },
      },
      boxShadow: {
        card: '0 2px 16px -4px rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        modal: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}
