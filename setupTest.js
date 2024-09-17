import * as matchers from '@testing-library/jest-dom/matchers'
import {afterEach} from 'vitest'
import {i18n} from '@/locales/index.js'

expect.extend({...matchers})

afterEach(() => {
  localStorage.clear()
  i18n.global.locale.value = 'en'
})
