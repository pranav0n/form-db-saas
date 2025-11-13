/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coss-night': '#030712',
        'coss-ink': '#0F172A',
        'coss-mint': '#2EE8A6',
        'coss-ember': '#FF7A45',
        'coss-cloud': '#E2E8F0',
      },
      fontFamily: {
        coss: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2.5rem',
      },
      boxShadow: {
        'coss-card': '0 45px 120px rgba(3, 7, 18, 0.55)',
      },
    },
  },
  plugins: [],
}

