/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#A855F7',
          pink: '#EC4899',
          blue: '#3B82F6',
        }
      },
      animation: {
        blob: 'blob 7s infinite',
      },
    },
  },
  plugins: [],
}
