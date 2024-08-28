import {AppInput} from '@/components/index.js'
import {render} from '@testing-library/vue'

const DEFAULT_PROPS = {
  id: 'test',
  label: 'test',
}

const ERROR_PROPS = {
  errorMessage: 'Error message',
  ...DEFAULT_PROPS,
}

const INVALID_INPUT_CLASS = 'is-invalid'
const INVALID_FEEDBACK_CLASS = 'invalid-feedback'

const renderAppInput = (props) => render(AppInput, {props})

describe('<AppInput />', () => {
  describe('when error message is set', () => {
    it('has is-invalid class for input', () => {
      const {container} = renderAppInput(ERROR_PROPS)
      const input = container.querySelector('input')
      expect(input).toHaveClass(INVALID_INPUT_CLASS)
    })

    it('has invalid-feedback class for span', () => {
      const {container} = renderAppInput(ERROR_PROPS)
      const span = container.querySelector('span')
      expect(span).toHaveClass(INVALID_FEEDBACK_CLASS)
    })
  })

  describe('when error message is not set', () => {
    it('does not have is-invalid class for input', () => {
      const {container} = renderAppInput(DEFAULT_PROPS)
      const input = container.querySelector('input')
      expect(input).not.toHaveClass(INVALID_INPUT_CLASS)
    })
  })
})
