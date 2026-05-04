/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5E9',
          500: '#66BB6A',
          700: '#2E7D32',
        },
        ink: '#1F2937',
        canvas: '#F7F7F5',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(31,41,55,0.18)',
      },
    },
  },
  plugins: [],
}
