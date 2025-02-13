// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
  ],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/'
    }
  },
  tailwindcss: {
    configPath: 'tailwind.config.js'
  },
  icon: {
    serverBundle: {
      collections: ['mdi'],
    }
  }
})
