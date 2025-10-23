/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          black: '#000000',
          gray: '#121212',
          lightGray: '#282828',
          green: '#1DB954',
          darkGreen: '#1aa34a',
        }
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        sans: ['Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
