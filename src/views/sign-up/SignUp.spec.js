import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import SignUp from './SignUp.vue'

describe('SignUp Component', () => {
  beforeEach(() => {
    render(SignUp)
  })

  it('has Sign Up header', () => {
    const header = screen.getByRole('heading', { name: /Sign Up/i })
    expect(header).toBeInTheDocument()
  })

  it('has username input', () => {
    expect(screen.queryByLabelText('Username')).toBeInTheDocument()
  })

  it('has email input', () => {
    expect(screen.queryByLabelText('Email')).toBeInTheDocument()
  })

  it('has password input', () => {
    expect(screen.queryByLabelText('Password')).toBeInTheDocument()
  })

  it('has password type for password input', () => {
    expect(screen.queryByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('has password repeat input', () => {
    expect(screen.queryByLabelText('Password repeat')).toBeInTheDocument()
  })

  it('has password type for password repeat input', () => {
    expect(screen.queryByLabelText('Password repeat')).toHaveAttribute('type', 'password')
  })

  it('has sign up button', () => {
    const button = screen.getByRole('button', { name: /Sign Up/i })
    expect(button).toBeInTheDocument()
  })

  it('disables the button initially', () => {
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeDisabled()
  })

  describe('when user sets the same value for password inputs', () => {
    const user = userEvent.setup()
    it('enables the button', async () => {
      const passwordInput = screen.getByLabelText('Password')
      const passwordRepeatInput = screen.getByLabelText('Password repeat')
      await user.type(passwordInput, 'password')
      await user.type(passwordRepeatInput, 'password')
      expect(screen.getByRole('button', { name: /Sign Up/i })).toBeEnabled()
    })
  })
})
