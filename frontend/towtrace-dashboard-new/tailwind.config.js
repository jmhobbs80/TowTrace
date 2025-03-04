/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0f0ff',
          200: '#c0e0ff',
          300: '#a0d0ff',
          400: '#70b0ff',
          500: '#4090ff',
          600: '#0f6ce4',
          700: '#0050b0',
          800: '#003f8f',
          900: '#003070',
          950: '#00204f',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system', 
          'BlinkMacSystemFont', 
          '"Segoe UI"', 
          'Roboto', 
          '"Helvetica Neue"', 
          'Arial', 
          'sans-serif'
        ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}