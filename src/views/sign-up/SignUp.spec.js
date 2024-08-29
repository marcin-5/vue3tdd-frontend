import {delay, http, HttpResponse} from 'msw'
import {afterAll, afterEach, beforeAll, beforeEach, expect} from 'vitest'
import {render, screen, waitFor} from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import SignUp from './SignUp.vue'
import {setupServer} from 'msw/node'
import {
  API_ENDPOINT,
  CREDENTIALS,
  ERROR_MESSAGE,
  INPUT_LABELS,
  SIGN_UP_BUTTON_LABEL,
  SUCCESS_MESSAGE,
} from './SignUpTestConstants'

// Utility functions
const fillInput = async (label, value) => {
  const input = screen.getByLabelText(label)
  const localUser = userEvent.setup()
  await clearInput(label)
  await localUser.type(input, value)
  return input
}

const clearInput = async (label) => {
  const input = screen.getByLabelText(label)
  await userEvent.clear(input)
}

const expectInputToBeInTheDocument = (label) => {
  expect(screen.queryByLabelText(label)).toBeInTheDocument()
}

const expectPasswordInputType = (label) => {
  expect(screen.queryByLabelText(label)).toHaveAttribute('type', 'password')
}

const signUpButtonSelector = {name: SIGN_UP_BUTTON_LABEL}

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

let counter, requestBody

const server = setupServer(
  http.post(API_ENDPOINT, async ({request}) => {
    requestBody = await request.json()
    counter += 1
    return HttpResponse.json({message: SUCCESS_MESSAGE})
  }),
)

// Render function for the form
const renderSignUpForm = async () => {
  const result = render(SignUp)
  await fillInput(INPUT_LABELS.username, CREDENTIALS.username)
  await fillInput(INPUT_LABELS.email, CREDENTIALS.email)
  const passwordInput = await fillInput(INPUT_LABELS.password, CREDENTIALS.password)
  const passwordRepeatInput = await fillInput(
    INPUT_LABELS.passwordRepeat,
    CREDENTIALS.passwordRepeat,
  )
  const button = screen.getByRole('button', signUpButtonSelector)
  const user = userEvent.setup()
  return {
    ...result,
    user,
    elements: {button, passwordInput, passwordRepeatInput},
  }
}

// Tests for initial render and static elements
describe('SignUp Component Initialization Tests', () => {
  beforeEach(() => {
    render(SignUp)
  })

  const tests = {
    'has Sign Up header': () => {
      const header = screen.getByRole('heading', signUpButtonSelector)
      expect(header).toBeInTheDocument()
    },
    'has username input': () => expectInputToBeInTheDocument(INPUT_LABELS.username),
    'has email input': () => expectInputToBeInTheDocument(INPUT_LABELS.email),
    'has password input': () => expectInputToBeInTheDocument(INPUT_LABELS.password),
    'has password type for password input': () => expectPasswordInputType(INPUT_LABELS.password),
    'has password repeat input': () => expectInputToBeInTheDocument(INPUT_LABELS.passwordRepeat),
    'has password type for password repeat input': () =>
      expectPasswordInputType(INPUT_LABELS.passwordRepeat),
    'has sign up button': () => {
      const button = screen.getByRole('button', signUpButtonSelector)
      expect(button).toBeInTheDocument()
    },
    'disables the button initially': () => {
      expect(screen.getByRole('button', signUpButtonSelector)).toBeDisabled()
    },
    'does not display spinner': () => {
      expect(screen.queryByRole('status', signUpButtonSelector)).not.toBeInTheDocument()
    },
  }

  Object.entries(tests).forEach(([description, testFunc]) => {
    it(description, testFunc)
  })
})

// Tests for user interaction and API integration
describe('SignUp Component User Interaction and API Integration Tests', () => {
  describe('Password Match Validation', () => {
    beforeAll(() => server.listen())
    afterAll(() => server.close())
    afterEach(() => server.resetHandlers())
    beforeEach(() => {
      counter = 0
    })

    it('enables sign up button when passwords match', async () => {
      const {
        elements: {button},
      } = await renderSignUpForm()

      expect(button).toBeEnabled()
    })

    describe('when passwords do not match', () => {
      it('displays error', async () => {
        const {
          user,
          elements: {passwordInput, passwordRepeatInput},
        } = await renderSignUpForm()
        await user.type(passwordInput, '123')
        await user.type(passwordRepeatInput, '456')
        expect(screen.getByText('Password mismatch')).toBeInTheDocument()
      })
    })

    describe('Form Submission', () => {
      it('sends username, email, and password to the backend', async () => {
        await setupAndClickButton()
        await waitFor(() => {
          expect(requestBody).toEqual({
            username: CREDENTIALS.username,
            email: CREDENTIALS.email,
            password: CREDENTIALS.password,
          })
        })
      })

      describe('when there is an ongoing API call', () => {
        it('does not allow clicking the button', async () => {
          await setupAndClickButton(2)
          await waitFor(() => {
            expect(counter).toBe(1)
          })
        })

        it('displays spinner', async () => {
          server.use(
            http.post(API_ENDPOINT, async () => {
              await delay('infinite')
              return HttpResponse.json()
            }),
          )
          await setupAndClickButton()
          expect(screen.getByRole('status')).toBeInTheDocument()
        })
      })

      describe('when success response is received', () => {
        it('displays message received from backend', async () => {
          await setupAndClickButton()
          const text = await screen.findByText(SUCCESS_MESSAGE)
          expect(text).toBeInTheDocument()
        })
        it('hides sign up form', async () => {
          const {user, button} = await setupAndClickButton(0)
          const form = screen.getByTestId('sign-up-form')
          clickButton(user, button)
          await waitFor(() => {
            expect(form).not.toBeInTheDocument()
          })
        })
      })

      describe('when network failure occurs', () => {
        it('displays generic message', async () => {
          server.use(
            http.post(API_ENDPOINT, async () => {
              return HttpResponse.error()
            }),
          )
          await setupAndClickButton()
          const text = await screen.findByText(ERROR_MESSAGE)
          expect(text).toBeInTheDocument()
        })

        it('hides spinner', async () => {
          server.use(
            http.post(API_ENDPOINT, async () => {
              return HttpResponse.error()
            }),
          )
          await setupAndClickButton()
          await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
          })

          describe('when user submits again', async () => {
            it('hides error when api request in progress', async () => {
              let processedFirstRequest = false
              server.use(
                http.post(API_ENDPOINT, async () => {
                  if (!processedFirstRequest) {
                    processedFirstRequest = true
                    return HttpResponse.error()
                  } else return HttpResponse.json({})
                }),
              )
              const {user, button} = await setupAndClickButton()
              const text = await screen.findByText(ERROR_MESSAGE)
              await clickButton(user, button)
              await waitFor(() => {
                expect(text).not.toBeInTheDocument()
              })
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
          server.use(
            http.post(API_ENDPOINT, () => {
              return HttpResponse.json({validationErrors: {[field]: message}}, {status: 400})
            }),
          )
          await setupAndClickButton()
          const validationError = await screen.findByText(message)
          expect(validationError).toBeInTheDocument()
        })
      })
    })
  })
})
