import {render} from '@testing-library/vue'
import {createI18n} from 'vue-i18n'
import en from '@/locales/translations/en.json'
import pl from '@/locales/translations/pl.json'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: {en, pl},
})

const globalOptions = {
  global: {
    plugins: [i18n],
  },
}

const customRender = (component, options) => {
  return render(component, {
    ...globalOptions,
    ...options,
  })
}

export * from '@testing-library/vue'
export {customRender as render}
