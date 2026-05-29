import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d0f',
        surface: '#14141a',
        deep: '#0a0a0d',
        cyan: '#6478ff',
        'cyan-glow': '#8898ff',
        magenta: '#a78bff',
        body: '#d0d8ff',
        muted: '#3a3a5a',
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
