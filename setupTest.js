import * as matchers from '@testing-library/jest-dom/matchers'
import {afterEach} from 'vitest'
import {i18n} from '@/locales/index.js'

expect.extend({...matchers})

afterEach(() => {
  i18n.global.locale.value = 'en'
})
