/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#131313',
        'surface-low': '#1b1b1b',
        'surface-highest': '#353535',
        primary: '#ff2a2a',
        'primary-container': '#cc0000',
        'inverse-primary': '#ff6666',
        'on-surface': '#e2e2e2',
        'outline-variant': '#603e39',
        error: '#ff2a2a',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    }
  },
  plugins: []
};
