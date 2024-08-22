import SignUp from './SignUp.vue'
import { render, screen } from '@testing-library/vue'
import { expect } from 'vitest'

describe('Sign Up', () => {
  it('has Sign Up header', () => {
    render(SignUp)
    const header = screen.getByRole('heading', { name: /Sign Up/i })
    expect(header).toBeInTheDocument()
  })
})
