import { defineConfig } from 'vitepress';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "gradiente",
  description: "Lightweight gradient toolkit for modern rendering systems.",
  base: '/gradiente/',

  vite: {
    resolve: {
      alias: {
        gradiente: resolve(rootDir, "packages/gradiente/src/index.ts"),
      },
    },
  },

  head: [
    // 1. Main icons
    ['link', { rel: 'icon', href: '/gradiente/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/gradiente/favicon-16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/gradiente/favicon-32x32.png' }],

    // 2. Apple touch
    ['link', { rel: 'apple-touch-icon', href: '/gradiente/apple-touch-icon.png' }],

    // 3. Webmanifest and Android icons
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/gradiente/android-chrome-192x192.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/gradiente/android-chrome-512x512.png' }],
    ['link', { rel: 'manifest', href: '/gradiente/site.webmanifest' }],

    ['meta', { name: 'theme-color', content: '#d84f4c' }],
  ],

  // Common Settings
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: 'gradiente',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Flowscape-UI/gradiente' }
    ],
    // Настройки поиска (общие для всех)
    search: {
      provider: 'local'
    },
  },

  locales: {
    // English Version
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: "Getting Started", link: "/getting-started" },
          {
            text: 'Playground',
            items: [
              { text: 'DSL Playground', link: '/playground/dsl' },
              { text: 'Gradient Playground', link: 'https://flowscape-ui.github.io/gradiente/playground' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'Introduction',
            items: [
              { text: 'What is Gradiente?', link: '/what-is-gradiente' },
              { text: 'Getting Started', link: '/getting-started' },
            ]
          },
          {
            text: 'Core API',
            items: [
              { text: 'Introduction', link: '/core-api/intro' },
              { text: 'Working with gradients', link: '/core-api/working-with-gradients' },
              {
                text: 'Gradient Types',
                items: [
                  { text: 'Overview', link: '/core-api/gradients/' },
                  { text: 'Linear', link: '/core-api/gradients/linear' },
                  { text: 'Radial', link: '/core-api/gradients/radial' },
                  { text: 'Diamond', link: '/core-api/gradients/diamond' },
                  { text: 'Conic', link: '/core-api/gradients/conic' },
                  { text: 'Mesh', link: '/core-api/gradients/mesh' },
                ],
              },
              { text: 'Transformers', link: '/core-api/transformers' },
              { text: 'Custom Transformers', link: '/core-api/custom-transformers' },
              { text: 'Custom Gradients', link: '/core-api/custom-gradients' },
              { text: 'Examples', link: '/core-api/examples' },
            ],
          },
          {
            text: 'DSL Patterns',
            items: [
              { text: 'What is DSL?', link: '/dsl/what-is-dsl' },
              { text: 'How to read DSL?', link: '/dsl/how-to-read-dsl' },
              { text: 'Design Guide', link: '/dsl/design-guide' },
              { text: 'Real-World Examples', link: '/dsl/real-world-examples' },
              { text: 'Design Your Own Patterns', link: '/dsl/design-your-own-patterns' },
            ],
          },
          {
            text: 'Playground',
            items: [
              { text: 'DSL Playground', link: '/playground/dsl' },
              { text: 'Gradient Playground', link: 'https://flowscape-ui.github.io/gradiente/playground' }
            ]
          },
        ]
      }
    },

    // Russion version
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      themeConfig: {
        nav: [
          { text: "Перейти к документации", link: "/ru/getting-started" },
          {
            text: 'Playground',
            items: [
              { text: 'DSL Playground', link: '/playground/dsl' },
              { text: 'Gradient Playground', link: 'https://flowscape-ui.github.io/gradiente/playground' }
            ]
          }
        ],
        sidebar: [
          {
            text: 'Введение',
            items: [
              { text: 'Чем является gradiente?', link: '/ru/what-is-gradiente' },
              { text: 'Быстрый старт', link: '/ru/getting-started' },
            ]
          },
          {
            text: 'Ключевое API',
            items: [
              { text: 'Введение', link: '/ru/core-api/intro' },
              { text: 'Объект градиента', link: '/ru/core-api/working-with-gradients' },
              {
                text: 'Типы градиентов',
                items: [
                  { text: 'Обзор', link: '/ru/core-api/gradients/' },
                  { text: 'Linear', link: '/ru/core-api/gradients/linear' },
                  { text: 'Radial', link: '/ru/core-api/gradients/radial' },
                  { text: 'Diamond', link: '/ru/core-api/gradients/diamond' },
                  { text: 'Conic', link: '/ru/core-api/gradients/conic' },
                  { text: 'Mesh', link: '/ru/core-api/gradients/mesh' },
                ],
              },
              { text: 'Трансформеры', link: '/ru/core-api/transformers' },
              { text: 'Кастомные трансформеры', link: '/ru/core-api/custom-transformers' },
              { text: 'Кастомные градиенты', link: '/ru/core-api/custom-gradients' },
              { text: 'Примеры', link: '/ru/core-api/examples' },
            ],
          },
          {
            text: 'Паттерны DSL',
            items: [
              { text: 'Что такое DSL?', link: '/ru/dsl/what-is-dsl' },
              { text: 'Как читать DSL?', link: '/ru/dsl/how-to-read-dsl' },
              { text: 'Руководство по дизайну', link: '/ru/dsl/design-guide' },
              { text: 'Реальные примеры', link: '/ru/dsl/real-world-examples' },
              { text: 'Создание собственных паттернов', link: '/ru/dsl/design-your-own-patterns' },
            ],
          },
          {
            text: 'Playground',
            items: [
              { text: 'DSL Playground', link: '/playground/dsl' },
              { text: 'Gradient Playground', link: 'https://flowscape-ui.github.io/gradiente/playground' }
            ]
          },
        ]
      }
    }
  },
});
