import { configDefaults, defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  define: {
    __DEV__: process.env.MODE !== 'benchmark',
    __SSR__: true,
    __VERSION__: '"test"',
    __TEST__: true,
    __E2E_TEST__: false,
  },
  resolve: {
    // alias: {},
  },
  test: {
    globals: true,
    pool: 'threads',
    setupFiles: 'scripts/setup-vitest.ts',
    sequence: {
      hooks: 'list',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['packages/*/src/**'],
      // exclude: [],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit-gc',
          pool: 'forks',
          execArgv: ['--expose-gc'],
          include: ['packages/*/tests/*.gc.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit',
          exclude: [
            ...configDefaults.exclude,
            'packages/*/tests/*.{gc,dom}.spec.ts',
            'packages/*/tests/bench/**',
            '**/e2e/**',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-jsdom',
          environment: 'jsdom',
          include: ['packages/*/tests/*.dom.spec.ts'],
          exclude: [...configDefaults.exclude, '**/e2e/**'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          environment: 'jsdom',
          isolate: true,
          include: ['packages/*/tests/e2e/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'bench-browser',
          include: [],
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
              },
            }),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
          benchmark: {
            include: ['packages/*/tests/bench/*.bench.ts'],
          },
        },
      },
    ],
  },
})
