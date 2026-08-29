/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          bg: '#FDFCFB',
          surface: '#FFFFFF',
          border: '#E8E4E1',
          'border-strong': '#D1CEC8',
          text: '#1A1C1E',
          'text-muted': '#5C5E60',
          'text-subtle': '#8A8885',
        },
        primary: {
          DEFAULT: '#2C5F2D',
          50:  '#F3F7F3',
          100: '#E4EFE4',
          200: '#C5D9C5',
          300: '#A6BFA6',
          400: '#87B187',
          500: '#68A368',
          600: '#499549',
          700: '#2C5F2D',
          800: '#244D25',
          900: '#1B3B1C',
          950: '#0D1D0D',
        },
        secondary: {
          DEFAULT: '#97BC62',
          100: '#F2F6EE',
          200: '#E0EBCB',
          300: '#CEDB9F',
          400: '#B2C782',
          500: '#97BC62',
          600: '#7D9F4F',
          700: '#63823B',
          800: '#4A652B',
          900: '#31481B',
          950: '#17240B',
        },
        accent: {
          DEFAULT: '#D4A373',
          100: '#FBF5ED',
          200: '#F5EBE0',
          300: '#EADBCB',
          400: '#DDB99D',
          500: '#D4A373',
          600: '#B6875B',
          700: '#986B41',
          800: '#7A4F27',
          900: '#5C3312',
          950: '#3C1B0B',
        },
        urgency: {
          mild:      '#16A34A',
          moderate:  '#D97706',
          emergency: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glass': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'fade-up':    'fade-up 0.4s ease-out both',
        'shimmer': 'shimmer 2s infinite',
      }
    },
  },
  plugins: [],
}
