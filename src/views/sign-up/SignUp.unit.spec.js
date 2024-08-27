import {render, screen, waitFor} from '@testing-library/vue'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import {afterEach, beforeEach, vi} from 'vitest'
import {CREDENTIALS, INPUT_LABELS, SIGN_UP_BUTTON_LABEL} from './SignUpTestConstants'

// Mock axios
vi.mock('axios')

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})

const API_ENDPOINT = '/api/v1/users'
const SUCCESS_MESSAGE = 'User create success'
const ERROR_MESSAGE = 'Unexpected error occurred, please try again'

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

async function setupAndClickButton(clickCount = 1) {
  const {
    user,
    elements: {button},
  } = await renderSignUpForm()
  while (clickCount-- > 0) await clickButton(user, button)
  return {user, button}
}

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, and password to the backend', async () => {
        axios.post.mockResolvedValue({data: {}})
        await setupAndClickButton()
        expect(axios.post).toHaveBeenCalledWith(API_ENDPOINT, {
          username: CREDENTIALS.username,
          email: CREDENTIALS.email,
          password: CREDENTIALS.password,
        })
      })
    })

    describe('when there is an ongoing API call', () => {
      it('does not allow clicking the button again', async () => {
        axios.post.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({data: {}}), 1000)),
        )
        await setupAndClickButton(2)
        expect(axios.post).toHaveBeenCalledTimes(1)
      })

      it('displays spinner', async () => {
        axios.post.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({data: {}}), 1000)),
        )
        await setupAndClickButton()
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    describe('when success response is received', () => {
      beforeEach(() => {
        axios.post.mockResolvedValue({data: {message: SUCCESS_MESSAGE}})
      })

      it('displays message received from backend', async () => {
        await setupAndClickButton()
        const successMessage = await screen.findByText(SUCCESS_MESSAGE)
        expect(successMessage).toBeInTheDocument()
      })

      it('hides sign up form', async () => {
        const {user, button} = await setupAndClickButton(0)
        const form = screen.getByTestId('sign-up-form')
        await clickButton(user, button)
        await waitFor(() => {
          expect(form).not.toBeInTheDocument()
        })
      })
    })

    describe('when network failure occurs', () => {
      beforeEach(() => {
        axios.post.mockRejectedValue({})
      })

      it('displays generic message', async () => {
        await setupAndClickButton()
        const errorMessage = await screen.findByText(ERROR_MESSAGE)
        expect(errorMessage).toBeInTheDocument()
      })

      it('hides spinner', async () => {
        await setupAndClickButton()
        await waitFor(() => {
          expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
      })
    })
  })
})
