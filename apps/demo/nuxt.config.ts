// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/ui'],
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  ssr: true,

  runtimeConfig: {
    public: {
      githubRepositoryLink: '',
    },
  },

  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
})
