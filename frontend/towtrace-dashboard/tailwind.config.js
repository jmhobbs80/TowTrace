/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--towtrace-primary)",
        secondary: "var(--towtrace-secondary)",
        success: "var(--towtrace-success)",
        warning: "var(--towtrace-warning)",
        danger: "var(--towtrace-danger)",
        info: "var(--towtrace-info)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
