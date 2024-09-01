import {render, screen} from 'test/helper'
import LanguageSelector from '../LanguageSelector.vue'

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
      const {user} = render(LanguageTestComponent)
      await user.click(screen.getByTestId(`language-${language}-selector`))
      expect(screen.getByText(text)).toBeInTheDocument()
    })

    it('stores language in localStorage', async () => {
      const {user} = render(LanguageTestComponent)
      await user.click(screen.getByTestId(`language-${language}-selector`))
      expect(localStorage.getItem('app-lang')).toBe(language)
    })
  })
})
