import {beforeEach, vi} from 'vitest'
import {render, screen} from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import axios from "axios"
import SignUp from './SignUp.vue'

vi.mock('axios')

const BUTTON_LABEL = 'Sign Up'
const INPUT_LABELS = {
  username: 'Username',
  email: 'Email',
  password: 'Password',
  passwordRepeat: 'Password repeat',
}

const setupUserEvent = userEvent.setup()

const fillInput = async (label, value) => {
  const input = screen.getByLabelText(label)
  await setupUserEvent.type(input, value)
}

describe('SignUp Component', () => {
  beforeEach(() => {
    render(SignUp)
  })

  it('has Sign Up header', () => {
    const header = screen.getByRole('heading', {name: BUTTON_LABEL})
    expect(header).toBeInTheDocument()
  })

  it('has username input', () => {
    expect(screen.queryByLabelText(INPUT_LABELS.username)).toBeInTheDocument()
  })

  it('has email input', () => {
    expect(screen.queryByLabelText(INPUT_LABELS.email)).toBeInTheDocument()
  })

  it('has password input', () => {
    expect(screen.queryByLabelText(INPUT_LABELS.password)).toBeInTheDocument()
  })

  it('has password type for password input', () => {
    expect(screen.queryByLabelText(INPUT_LABELS.password)).toHaveAttribute('type', 'password')
  })

  it('has password repeat input', () => {
    expect(screen.queryByLabelText(INPUT_LABELS.passwordRepeat)).toBeInTheDocument()
  })

  it('has password type for password repeat input', () => {
    expect(screen.queryByLabelText(INPUT_LABELS.passwordRepeat)).toHaveAttribute('type', 'password')
  })

  it('has sign up button', () => {
    const button = screen.getByRole('button', {name: BUTTON_LABEL})
    expect(button).toBeInTheDocument()
  })

  it('disables the button initially', () => {
    expect(screen.getByRole('button', {name: BUTTON_LABEL})).toBeDisabled()
  })

  describe('when user sets the same value for password inputs', () => {
    beforeEach(async () => {
      const passwordInput = screen.getByLabelText(INPUT_LABELS.password)
      const passwordRepeatInput = screen.getByLabelText(INPUT_LABELS.passwordRepeat)
      await setupUserEvent.type(passwordInput, 'password')
      await setupUserEvent.type(passwordRepeatInput, 'password')
    })

    it('enables the button', () => {
      expect(screen.getByRole('button', {name: BUTTON_LABEL})).toBeEnabled()
    })

    describe('when user submits form', () => {
      const credentials = {
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
        passwordRepeat: 'P4ssword',
      }

      it('sends username, email, and password to the backend', async () => {
        await fillInput(INPUT_LABELS.username, credentials.username)
        await fillInput(INPUT_LABELS.email, credentials.email)
        await fillInput(INPUT_LABELS.password, credentials.password)
        await fillInput(INPUT_LABELS.passwordRepeat, credentials.passwordRepeat)

        const button = screen.getByRole('button', {name: BUTTON_LABEL})
        await setupUserEvent.click(button)

        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        })
      })
    })
  })
})
