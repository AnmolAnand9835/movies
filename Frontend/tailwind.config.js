/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A101B',
        panel: '#111B2A',
        raised: '#172438',
        mist: '#F2F5FA',
        muted: '#A7B3C5',
        accent: {
          DEFAULT: '#A9BAFF',
          strong: '#C0CCFF',
        },
        gold: '#E8C58A',
        line: 'rgba(190, 207, 232, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-accent': '0 8px 28px rgba(145, 166, 245, 0.14)',
        panel: '0 16px 50px rgba(0, 0, 0, 0.24)',
        card: '0 14px 32px rgba(2, 8, 20, 0.28)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-in': {
          '0%': { opacity: '0', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'fade-up': 'fade-up 0.45s ease both',
        'hero-in': 'hero-in 0.7s ease both',
      },
    },
  },
  plugins: [],
};
