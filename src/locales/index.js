import {createI18n} from 'vue-i18n'
import en from './translations/en.json'
import pl from './translations/pl.json'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'pl',
  fallbackLng: 'en',
  messages: {en, pl},
})
