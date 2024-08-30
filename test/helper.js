import {i18n} from '@/locales/index.js'
import {render} from '@testing-library/vue'

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
