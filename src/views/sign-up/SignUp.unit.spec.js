import {render, screen} from '@testing-library/vue'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import {afterEach, vi} from 'vitest'
import {CREDENTIALS, INPUT_LABELS, SIGN_UP_BUTTON_LABEL} from './SignUpTestConstants'

// Mock axios
vi.mock('axios')

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

const renderSignUpForm = () => {
  render(SignUp)
}

const fillFormFields = async (user) => {
  const usernameInput = screen.getByLabelText(INPUT_LABELS.username)
  const emailInput = screen.getByLabelText(INPUT_LABELS.email)
  const passwordInput = screen.getByLabelText(INPUT_LABELS.password)
  const passwordRepeatInput = screen.getByLabelText(INPUT_LABELS.passwordRepeat)

  await user.type(usernameInput, CREDENTIALS.username)
  await user.type(emailInput, CREDENTIALS.email)
  await user.type(passwordInput, CREDENTIALS.password)
  await user.type(passwordRepeatInput, CREDENTIALS.passwordRepeat)
}

const getSubmitButton = () => {
  return screen.getByRole('button', {name: SIGN_UP_BUTTON_LABEL})
}

// Tests
describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, password to the backend', async () => {
        const user = userEvent.setup()
        renderSignUpForm()
        await fillFormFields(user)
        const submitButton = getSubmitButton()

        await user.click(submitButton)

        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: CREDENTIALS.username,
          email: CREDENTIALS.email,
          password: CREDENTIALS.password,
        })
      })
    })

    describe('when there is an ongoing api call', () => {
      it('does not allow clicking the button', async () => {
        const user = userEvent.setup()
        renderSignUpForm()
        await fillFormFields(user)
        const submitButton = getSubmitButton()

        await user.click(submitButton)
        await user.click(submitButton)

        expect(axios.post).toHaveBeenCalledTimes(1)
      })
    })
  })
})
