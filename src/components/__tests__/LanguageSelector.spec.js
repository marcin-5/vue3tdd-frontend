import {render, screen} from 'test/helper'
import LanguageSelector from '../LanguageSelector.vue'
import userEvent from '@testing-library/user-event'

const LanguageTestComponent = {
  components: {
    LanguageSelector,
  },
  template: `
    <span>{{ $t('signUp') }}</span>
    <LanguageSelector />
  `,
}

const languageTestCases = [
  {language: 'pl', text: 'Zarejestruj się'},
  {language: 'en', text: 'Sign Up'},
]

describe('Language selector', () => {
  describe.each(languageTestCases)('when user selects $language', ({language, text}) => {
    it('displays expected text', async () => {
      const user = userEvent.setup()
      render(LanguageTestComponent)
      await user.click(screen.getByTestId(`language-${language}-selector`))
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })
})
