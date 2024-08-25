import {http, HttpResponse} from 'msw'
import {afterAll, afterEach, beforeAll, beforeEach} from 'vitest'
import {render, screen, waitFor} from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import SignUp from './SignUp.vue'
import {setupServer} from 'msw/node'
import {CREDENTIALS, INPUT_LABELS, SIGN_UP_BUTTON_LABEL} from './SignUpTestConstants'

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

let counter, requestBody

const server = setupServer(
  http.post('/api/v1/users', async ({request}) => {
    requestBody = await request.json()
    counter += 1
    return HttpResponse.json({})
  }),
)

const renderSignUpForm = async () => {
  await fillInput(INPUT_LABELS.username, CREDENTIALS.username)
  await fillInput(INPUT_LABELS.email, CREDENTIALS.email)
  await fillInput(INPUT_LABELS.password, CREDENTIALS.password)
  await fillInput(INPUT_LABELS.passwordRepeat, CREDENTIALS.passwordRepeat)
  const button = screen.getByRole('button', signUpButtonSelector)
  const user = userEvent.setup()
  const result = render(SignUp)
  return {
    ...result,
    user,
    elements: {button},
  }
}

const clickButton = async (user, button) => {
  await user.click(button)
}

describe('SignUp Component', () => {
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

  describe('when user sets same value for password inputs', () => {
    beforeAll(() => server.listen())
    afterAll(() => server.close())
    afterEach(() => server.resetHandlers())
    beforeEach(() => {
      counter = 0
    })

    it('enables button', async () => {
      const {
        elements: {button},
      } = await renderSignUpForm()

      expect(button).toBeEnabled()
    })

    describe('when user submits the form', () => {
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
          const {
            user,
            elements: {button},
          } = await renderSignUpForm()

          await clickButton(user, button)
          expect(screen.getByRole('status')).toBeInTheDocument()
        })
      })
    })
  })
})
