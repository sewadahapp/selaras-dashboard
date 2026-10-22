import { settingsSections } from './app/data/settings'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-21',
  devtools: { enabled: true },
  modules: ['@sewadah/selaras', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  nitro: {
    // Route-backed tab buttons do not expose links to the prerender crawler.
    prerender: { routes: settingsSections.map((section) => section.to) },
  },
  icon: {
    serverBundle: { collections: ['hugeicons'] },
    clientBundle: {
      scan: { globInclude: ['app/**/*.{vue,ts}'] },
      // Selaras chooses these internal icons dynamically, outside the app scan.
      icons: [
        'hugeicons:cancel-01',
        'hugeicons:tick-02',
        'hugeicons:arrow-down-01',
        'hugeicons:loading-02',
        'hugeicons:search-01',
        'hugeicons:sun-01',
        'hugeicons:moon',
        'hugeicons:sidebar-left-01',
        'hugeicons:arrow-up-02',
        'hugeicons:arrow-down-02',
        'hugeicons:sorting-05',
        'hugeicons:arrow-left-01',
        'hugeicons:arrow-right-01',
        'hugeicons:checkmark-circle-01',
        'hugeicons:cancel-circle',
        'hugeicons:alert-circle',
        'hugeicons:information-circle',
      ],
    },
  },
  app: {
    head: {
      title: 'Selaras Dashboard',
      meta: [
        {
          name: 'description',
          content: 'A Nuxt 4 dashboard starter built with Selaras, TanStack Charts, and Tiptap.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      htmlAttrs: { lang: 'en' },
    },
  },
})
