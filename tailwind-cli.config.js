module.exports = {
  content: [
    "/Users/retro/Desktop/Coding/DEV/KyteStudios/Website/**/*.html",
    "/Users/retro/Desktop/Coding/DEV/KyteStudios/Website/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        bg: '#FAF9F6',
        ink: '#111111',
        tangerine: '#FF5522',
        electric: '#0055FF',
        surface: '#FFFFFF',
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px #111111',
        'brutal-sm': '4px 4px 0px 0px #111111',
        'brutal-hover': '2px 2px 0px 0px #111111',
      }
    }
  },
  plugins: [],
}
