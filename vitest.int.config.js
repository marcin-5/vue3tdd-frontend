import {fileURLToPath} from 'node:url'
import {configDefaults, defineConfig, mergeConfig} from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*', '**/*.unit.*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      setupFiles: ['./setupTest.js'],
      coverage: {
        enabled: false,
        provider: 'istanbul',
      },
    },
  }),
)
