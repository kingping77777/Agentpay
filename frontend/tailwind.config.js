/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        office: {
          floor: '#769b8b',
          wall: '#ffffff',
          dark: '#0c101d',
          panel: '#121829',
          cream: '#e8e2d4',
          creamCard: '#f4efe4',
        }
      }
    },
  },
  plugins: [],
}
