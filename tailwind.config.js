/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      scale: {
        '40': '0.4',
      },
      gridTemplateColumns: {
        '14': 'repeat(14, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(-10px)' },
          '100%': { opacity: '0', transform: 'translateY(-20px)' },
        },
      },
      animation: {
        fadeOut: 'fadeOut 2.5s ease-out forwards',
      },
    }
  },
  plugins: [],
};
