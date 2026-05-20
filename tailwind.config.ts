import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A1E1E',
        surface: '#111C1C',
        deep: '#060A0A',
        cyan: '#00E5E5',
        'cyan-glow': '#00FFEF',
        magenta: '#FF00C8',
        body: '#C8D8D8',
        muted: '#4A7070',
        amber: '#FFB800',
      },
      fontFamily: {
        russo: ['Russo One', 'sans-serif'],
        chakra: ['Chakra Petch', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
