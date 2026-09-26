/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#FFFFFF',
        surface: '#F7F7F7',
        border: '#E5E5E5',
        primary: {
          text: '#111111',
          DEFAULT: '#111111',
        },
        secondary: {
          text: '#666666',
          DEFAULT: '#666666',
        },
        accent: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          subtle: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
