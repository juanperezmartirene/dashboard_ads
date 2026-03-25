/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Asap"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      colors: {
        ucu: {
          navy:  '#173363',
          teal:  '#0096D1',
          teal2: '#0eafb1',
          gold:  '#CFAE38',
          text:  '#4a494f',
        },
      },
    },
  },
  plugins: [],
}
