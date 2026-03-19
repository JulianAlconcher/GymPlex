/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8f7',
          100: '#d7ece7',
          500: '#2f7b6d',
          700: '#235f54',
          900: '#173f39'
        }
      }
    }
  },
  plugins: []
};
