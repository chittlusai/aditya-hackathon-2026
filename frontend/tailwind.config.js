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
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          'border-strong': '#CBD5E1',
          text: '#0F172A',
          'text-muted': '#475569',
          'text-subtle': '#64748B',
        },
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0f172a',
        },
        urgency: {
          mild:      '#16A34A', // vibrant emerald
          moderate:  '#D97706', // warm amber
          emergency: '#DC2626', // clean red
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-slate': '0 0 25px -5px rgba(109, 129, 150, 0.4)',
        'glow-rose': '0 0 30px -5px rgba(184, 56, 56, 0.45)',
        'glow-amber': '0 0 25px -5px rgba(200, 121, 40, 0.4)',
        'glass': '0 8px 32px 0 rgba(74, 74, 74, 0.12)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.88', transform: 'scale(1.03)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(184, 56, 56, 0.4)' },
          '50%':       { boxShadow: '0 0 35px rgba(184, 56, 56, 0.85)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wave-bar': {
          '0%, 100%': { height: '8px' },
          '50%':       { height: '28px' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
        'fade-up':    'fade-up 0.4s ease-out both',
        'wave-1':     'wave-bar 0.8s ease-in-out infinite',
        'wave-2':     'wave-bar 0.9s ease-in-out infinite 0.15s',
        'wave-3':     'wave-bar 0.7s ease-in-out infinite 0.3s',
        'wave-4':     'wave-bar 1.0s ease-in-out infinite 0.1s',
      }
    },
  },
  plugins: [],
}
