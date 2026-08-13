/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a', // Green
          dark: '#15803d',
          light: '#22c55e',
        },
        secondary: {
          DEFAULT: '#ffffff', // White
        },
        accent: {
          DEFAULT: '#eab308', // Golden
        },
        background: {
          DEFAULT: '#f9fafb', // Very light gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
