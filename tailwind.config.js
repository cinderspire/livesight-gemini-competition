/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbff',
          100: '#d4f5ff',
          200: '#b2eeff',
          300: '#7de4ff',
          400: '#36d1f5',
          500: '#0cb8db',
          600: '#0094b8',
          700: '#037795',
          800: '#09617a',
          900: '#0d5167',
        },
        accent: {
          purple: '#a78bfa',
          pink: '#f472b6',
          emerald: '#34d399',
          amber: '#fbbf24',
          sky: '#38bdf8',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}

