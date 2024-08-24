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

let requestBody
const server = setupServer(
  http.post('/api/v1/users', async ({request}) => {
    requestBody = await request.json()
    return HttpResponse.json({})
  }),
)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

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

  describe('when user submits the form', () => {
    let button

    beforeEach(async () => {
      await fillInput(INPUT_LABELS.username, CREDENTIALS.username)
      await fillInput(INPUT_LABELS.email, CREDENTIALS.email)
      await fillInput(INPUT_LABELS.password, CREDENTIALS.password)
      await fillInput(INPUT_LABELS.passwordRepeat, CREDENTIALS.passwordRepeat)
      button = screen.getByRole('button', signUpButtonSelector)
      const localUser = userEvent.setup()
      await localUser.click(button)
    })

    it('enables button', () => {
      expect(button).toBeEnabled()
    })

    it('sends username, email, and password to the backend', async () => {
      await waitFor(() => {
        expect(requestBody).toEqual({
          username: CREDENTIALS.username,
          email: CREDENTIALS.email,
          password: CREDENTIALS.password,
        })
      })
    })
  })
})
