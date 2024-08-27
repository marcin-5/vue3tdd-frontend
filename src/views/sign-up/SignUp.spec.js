import {delay, http, HttpResponse} from 'msw'
import {afterAll, afterEach, beforeAll, beforeEach, expect} from 'vitest'
import {render, screen, waitFor} from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import SignUp from './SignUp.vue'
import {setupServer} from 'msw/node'
import {CREDENTIALS, INPUT_LABELS, SIGN_UP_BUTTON_LABEL} from './SignUpTestConstants'

// Utility functions
const fillInput = async (label, value) => {
  const input = screen.getByLabelText(label)
  const localUser = userEvent.setup()
  await clearInput(label)
  await localUser.type(input, value)
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

let counter, requestBody

const server = setupServer(
  http.post('/api/v1/users', async ({request}) => {
    requestBody = await request.json()
    counter += 1
    return HttpResponse.json({message: 'User create success'})
  }),
)

// Render function for the form
const renderSignUpForm = async () => {
  const result = render(SignUp)
  await fillInput(INPUT_LABELS.username, CREDENTIALS.username)
  await fillInput(INPUT_LABELS.email, CREDENTIALS.email)
  await fillInput(INPUT_LABELS.password, CREDENTIALS.password)
  await fillInput(INPUT_LABELS.passwordRepeat, CREDENTIALS.passwordRepeat)
  const button = screen.getByRole('button', signUpButtonSelector)
  const user = userEvent.setup()
  return {
    ...result,
    user,
    elements: {button},
  }
}

// Tests for initial render and static elements
describe('SignUp Component Initialization Tests', () => {
  beforeEach(() => {
    render(SignUp)
  })

  it('has Sign Up header', () => {
    const header = screen.getByRole('heading', signUpButtonSelector)
    expect(header).toBeInTheDocument()
  })

  it('has username input', () => {
    expectInputToBeInTheDocument(INPUT_LABELS.username)
  })

  it('has email input', () => {
    expectInputToBeInTheDocument(INPUT_LABELS.email)
  })

  it('has password input', () => {
    expectInputToBeInTheDocument(INPUT_LABELS.password)
  })

  it('has password type for password input', () => {
    expectPasswordInputType(INPUT_LABELS.password)
  })

  it('has password repeat input', () => {
    expectInputToBeInTheDocument(INPUT_LABELS.passwordRepeat)
  })

  it('has password type for password repeat input', () => {
    expectPasswordInputType(INPUT_LABELS.passwordRepeat)
  })

  it('has sign up button', () => {
    const button = screen.getByRole('button', signUpButtonSelector)
    expect(button).toBeInTheDocument()
  })

  it('disables the button initially', () => {
    expect(screen.getByRole('button', signUpButtonSelector)).toBeDisabled()
  })

  it('does not display spinner', () => {
    expect(screen.queryByRole('status', signUpButtonSelector)).not.toBeInTheDocument()
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

    describe('Form Submission', () => {
      it('sends username, email, and password to the backend', async () => {
        const {
          user,
          elements: {button},
        } = await renderSignUpForm()

        await clickButton(user, button)
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
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()

          await clickButton(user, button)
          await clickButton(user, button)
          await waitFor(() => {
            expect(counter).toBe(1)
          })
        })
        it('displays spinner', async () => {
          server.use(
            http.post('/api/v1/users', async () => {
              await delay('infinite')
              return HttpResponse.json()
            }),
          )
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()

          await clickButton(user, button)
          expect(screen.getByRole('status')).toBeInTheDocument()
        })
      })
      describe('when success response is received', () => {
        it('displays message received from backend', async () => {
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()

          await clickButton(user, button)
          const text = await screen.findByText('User create success')
          expect(text).toBeInTheDocument()
        })
        it('hides sign up form', async () => {
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()
          const form = screen.getByTestId('sign-up-form')
          await user.click(button)
          await waitFor(() => {
            expect(form).not.toBeInTheDocument()
          })
        })
      })
      describe('when network failure occurs', () => {
        it('displays generic message', async () => {
          server.use(
            http.post('/api/v1/users', async () => {
              return HttpResponse.error()
            }),
          )
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()
          await user.click(button)
          const text = await screen.findByText('Unexpected error occured, please try again')
          expect(text).toBeInTheDocument()
        })
        it('hides spinner', async () => {
          server.use(
            http.post('/api/v1/users', async () => {
              return HttpResponse.error()
            }),
          )
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()
          await user.click(button)
          await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
          })
          describe('when user submits again', async () => {
            it('hides error when api request in progress', async () => {
              let processedFirstRequest = false
              server.use(
                http.post('/api/v1/users', async () => {
                  if (!processedFirstRequest) {
                    processedFirstRequest = true
                    return HttpResponse.error()
                  } else return HttpResponse.json({})
                }),
              )
              const {
                user,
                elements: {button},
              } = await renderSignUpForm()
              await user.click(button)
              const text = await screen.findByText('Unexpected error occured, please try again')
              await user.click(button)
              await waitFor(() => {
                expect(text).not.toBeInTheDocument()
              })
            })
          })
        })
      })
    })
  })
})
