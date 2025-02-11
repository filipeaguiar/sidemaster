module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        blue: '#3dbdb0',
        purple: '#c07eb5',
        yellow: '#fdbc46',
        pink: '#ef6a97',
      }
    }
  },
  plugins: [],
}
