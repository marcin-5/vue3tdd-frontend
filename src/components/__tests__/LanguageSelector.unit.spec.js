import {render, screen} from '@testing-library/vue'
import LanguageSelector from '../LanguageSelector.vue'
import userEvent from '@testing-library/user-event'
import {useI18n} from 'vue-i18n'
import {beforeEach, vi} from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(),
}))

describe('Language selector', () => {
  const mockI18n = {
    locale: {
      value: 'en',
    },
  }

  beforeEach(() => {
    useI18n.mockReturnValue(mockI18n)
  })

  describe.each([{language: 'pl'}, {language: 'en'}])(
    'when user selects $language',
    ({language}) => {
      it('displays expected text', async () => {
        const user = userEvent.setup()

        render(LanguageSelector)
        await user.click(screen.getByTestId(`language-${language}-selector`))
        expect(mockI18n.locale.value).toBe(language)
      })

      it('stores language in localStorage', async () => {
        const mockSetItem = vi.spyOn(Storage.prototype, 'setItem')
        const user = userEvent.setup()

        render(LanguageSelector)
        await user.click(screen.getByTestId(`language-${language}-selector`))
        expect(mockSetItem).toHaveBeenCalledWith('app-lang', language)
      })
    },
  )
})
