import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        eva: {
          green:   '#3f6d4e',
          lime:    '#8bd450',
          dark:    '#1d1a2f',
          surface: '#252236',
          raised:  '#2e2b45',
          border:  '#3d3860',
          muted:   '#9585b8',
          purple:  '#965fd4',
          violet:  '#734f9a',
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('eva', '.eva-theme &')
    }),
  ],
}
