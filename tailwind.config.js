export default {
  darkMode: 'selector',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  safelist: [
    {
      pattern: /(bg|text|border|ring|from|to|via|divide|placeholder)-(slate|gray|zinc|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink|rose|white|black)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus', 'dark', 'disabled']
    }
  ],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif']
      }
    }
  },
  plugins: []
};