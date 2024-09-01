import {createI18n} from 'vue-i18n'
import en from './translations/en.json'
import pl from './translations/pl.json'

export const createInstance = () => {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale: localStorage.getItem('app-lang') || navigator.language?.split('-')[0] || 'en',
    messages: {en, pl},
  })
}

export const i18n = createInstance()
