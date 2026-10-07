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
        ig: {
          primary: '#0095F6',
          'primary-hover': '#1877F2',
          like: '#ED4956',
          bg: '#000000',
          surface: '#121212',
          card: '#262626',
          border: '#363636',
          'text-primary': '#F5F5F5',
          'text-secondary': '#A8A8A8',
          'border-light': '#DBDBDB',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ]
      },
      keyframes: {
        heartBurst: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' }
        },
        bounceSmall: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' }
        }
      },
      animation: {
        'heart-burst': 'heartBurst 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'bounce-small': 'bounceSmall 0.25s ease-in-out'
      }
    },
  },
  plugins: [],
}
