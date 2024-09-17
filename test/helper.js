import {render} from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import router from '@/router'
import {createPinia} from 'pinia'
import {i18n} from '@/locales'

const globalOptions = {
  global: {
    plugins: [i18n, router, createPinia()],
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
