import {render, screen} from '@testing-library/vue'
import SignUp from './SignUp.vue'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import {vi} from 'vitest'
import {CREDENTIALS, INPUT_LABELS, SIGN_UP_BUTTON_LABEL} from './SignUpTestConstants'

vi.mock('axios')

describe('Sign Up', () => {
  describe('when user sets same value for password inputs', () => {
    describe('when user submits form', () => {
      it('sends username, email, password to the backend', async () => {
        const user = userEvent.setup()
        render(SignUp)
        const usernameInput = screen.getByLabelText(INPUT_LABELS.username)
        const emailInput = screen.getByLabelText(INPUT_LABELS.email)
        const passwordInput = screen.getByLabelText(INPUT_LABELS.password)
        const passwordRepeatInput = screen.getByLabelText(INPUT_LABELS.passwordRepeat)
        await user.type(usernameInput, CREDENTIALS.username)
        await user.type(emailInput, CREDENTIALS.email)
        await user.type(passwordInput, CREDENTIALS.password)
        await user.type(passwordRepeatInput, CREDENTIALS.password)
        const button = screen.getByRole('button', {name: SIGN_UP_BUTTON_LABEL})
        await user.click(button)
        expect(axios.post).toHaveBeenCalledWith('/api/v1/users', {
          username: CREDENTIALS.username,
          email: CREDENTIALS.email,
          password: CREDENTIALS.password,
        })
      })
    })
  })
})
