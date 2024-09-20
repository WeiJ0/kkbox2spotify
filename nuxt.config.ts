import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  primevue: {
      components: {
        include: [
          'Toolbar',
          'Button',
          'InputText',
          'DataTable',
          'Column',
          'Dialog',
          'Steps',
          'Toast',
          'ProgressSpinner'
        ]
      },
      options: {
          theme: {
              preset: Aura,
              darkModeSelector: '.p-dark'
          }
      }
  }  
})
