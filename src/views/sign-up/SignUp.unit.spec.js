import {render, screen, waitFor} from '@testing-library/vue'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, expect, vi} from 'vitest'
import en from '@/locales/translations/en.json'
import {useI18n} from 'vue-i18n'
import {
  CREDENTIALS,
  ERROR_MESSAGE,
  INPUT_LABELS,
  SIGN_UP_BUTTON_LABEL,
  SUCCESS_MESSAGE,
} from './SignUpTestConstants'
import {signUp} from '@/views/sign-up/api.js'

// Mock axios and vue-i18n
vi.mock('./api')
vi.mock('vue-i18n')

vi.mocked(useI18n).mockReturnValue({
  t: (key) => en[key],
})

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
  return {
    usernameInput: usernameInput,
    emailInput: emailInput,
    passwordInput: passwordInput,
  }
}

const renderSignUpForm = async () => {
  const result = render(SignUp, {
    global: {
      mocks: {$t: (key) => en[key]},
    },
  })
  const user = userEvent.setup()
  const inputs = await fillFormFields(user)
  return {
    ...result,
    user,
    elements: {button: screen.getByRole('button', {name: SIGN_UP_BUTTON_LABEL}), ...inputs},
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
        signUp.mockResolvedValue({data: {}})
        await setupAndClickButton()
        expect(signUp).toHaveBeenCalledWith({
          username: CREDENTIALS.username,
          email: CREDENTIALS.email,
          password: CREDENTIALS.password,
        })
      })
    })

    describe('when there is an ongoing API call', () => {
      it('does not allow clicking the button again', async () => {
        signUp.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({data: {}}), 1000)),
        )
        await setupAndClickButton(2)
        expect(signUp).toHaveBeenCalledTimes(1)
      })

      it('displays spinner', async () => {
        signUp.mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({data: {}}), 1000)),
        )
        await setupAndClickButton()
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    describe('when success response is received', () => {
      beforeEach(() => {
        signUp.mockResolvedValue({data: {message: SUCCESS_MESSAGE}})
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
        signUp.mockRejectedValue({})
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

    describe('when user submits again', () => {
      it('hides error when api request is in progress', async () => {
        signUp.mockRejectedValueOnce({}).mockResolvedValue({data: {}})
        const {user, button} = await setupAndClickButton()
        const errorMessage = await screen.findByText(ERROR_MESSAGE)
        await clickButton(user, button)
        await waitFor(() => {
          expect(errorMessage).not.toBeInTheDocument()
        })
      })
    })
  })

  describe.each([
    {field: 'username', message: 'Invalid username'},
    {field: 'email', message: 'Invalid email'},
    {field: 'password', message: 'Invalid password'},
  ])('when $field is invalid', ({field, message}) => {
    it(`displays ${message}`, async () => {
      signUp.mockRejectedValue({
        response: {
          status: 400,
          data: {
            validationErrors: {[field]: message},
          },
        },
      })
      await setupAndClickButton()
      const validationError = await screen.findByText(message)
      expect(validationError).toBeInTheDocument()
    })

    it(`clears error after user updates ${field}`, async () => {
      signUp.mockRejectedValue({
        response: {
          status: 400,
          data: {
            validationErrors: {
              [field]: message,
            },
          },
        },
      })
      const {user, elements} = await renderSignUpForm()
      await clickButton(user, elements.button)
      const errorMessage = await screen.findByText(message)
      await user.type(elements[`${field}Input`], 'updated')
      expect(errorMessage).not.toBeInTheDocument()
    })
  })
})
