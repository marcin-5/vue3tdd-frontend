import {render} from '@testing-library/vue'
import {createI18n} from 'vue-i18n'
import en from '@/locales/translations/en.json'
import pl from '@/locales/translations/pl.json'
import userEvent from '@testing-library/user-event'
import router from '@/router'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  messages: {en, pl},
})

const globalOptions = {
  global: {
    plugins: [i18n, router],
  },
}

const customRender = (component, options) => {
  const user = userEvent.setup()
  const result = render(component, {
    ...globalOptions,
    ...options,
  })
  return {user, result}
}

export * from '@testing-library/vue'
export {customRender as render}
export {router}
