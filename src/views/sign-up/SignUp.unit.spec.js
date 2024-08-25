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

const renderSignUpForm = async () => {
  const result = render(SignUp)
  const user = userEvent.setup()
  await fillFormFields(user)
  return {
    ...result,
    user,
    elements: {button: screen.getByRole('button', {name: SIGN_UP_BUTTON_LABEL})},
  }
}

const clickButton = async (user, button) => {
  await user.click(button)
}

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, and password to the backend', async () => {
        axios.post.mockResolvedValue({data: {}})
        const {
          user,
          elements: {button},
        } = await renderSignUpForm()
        await clickButton(user, button)
        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: CREDENTIALS.username,
          email: CREDENTIALS.email,
          password: CREDENTIALS.password,
        })
      })
    })
    describe('when there is an ongoing API call', () => {
      it('does not allow clicking the button again', async () => {
        const {
          user,
          elements: {button},
        } = await renderSignUpForm()
        await clickButton(user, button)
        await clickButton(user, button)
        expect(axios.post).toHaveBeenCalledTimes(1)
      })
    })
  })
})
