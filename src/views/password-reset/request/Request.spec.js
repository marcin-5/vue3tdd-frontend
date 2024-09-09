import {render, screen, waitFor} from 'test/helper'
import Request from './RequestView.vue'
import {setupServer} from 'msw/node'
import {delay, http, HttpResponse} from 'msw'
import {i18n} from '@/locales'
import {afterAll, beforeAll, beforeEach} from 'vitest'

const API_URL = '/api/v1/users/password-reset'

const server = setupServer()

const resetServerHandlers = () => server.resetHandlers()
const startServer = () => server.listen()
const closeServer = () => server.close()

const initializeTestSetup = async () => {
  const {result, user} = render(Request)
  const emailInput = screen.getByLabelText('Email')
  await user.type(emailInput, 'user1@mail.com')
  const button = screen.queryByRole('button', {name: 'Reset password'})
  return {
    ...result,
    user,
    elements: {
      button,
      emailInput,
    },
  }
}

beforeEach(resetServerHandlers)
beforeAll(startServer)
afterAll(closeServer)

describe('Password Reset Request Page', () => {
  it('disables the button initially', () => {
    render(Request)
    expect(screen.queryByRole('button', {name: 'Reset password'})).toBeDisabled()
  })

  it('does not display spinner', async () => {
    render(Request)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  describe('when user sets email', () => {
    it('enables the button', async () => {
      const {
        elements: {button},
      } = await initializeTestSetup()
      expect(button).toBeEnabled()
    })

    describe('when user submits form', () => {
      it('sends email to backend', async () => {
        let requestBody
        server.use(
          http.post(API_URL, async ({request}) => {
            requestBody = await request.json()
            return HttpResponse.json({message: 'Check your email'})
          }),
        )
        const {
          user,
          elements: {button},
        } = await initializeTestSetup()
        await user.click(button)
        await waitFor(() => {
          expect(requestBody).toEqual({email: 'user1@mail.com'})
        })
      })

      describe('when there is an ongoing api request', () => {
        it('does not allow clicking to the button', async () => {
          let counter = 0
          server.use(
            http.post(API_URL, async () => {
              counter += 1
              await delay('infinite')
              return HttpResponse.json({message: 'Check your email'})
            }),
          )
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          await user.click(button)
          await waitFor(() => {
            expect(counter).toBe(1)
          })
        })

        it('displays spinner', async () => {
          server.use(
            http.post(API_URL, async () => {
              await delay('infinite')
              return HttpResponse.json({message: 'Check your email'})
            }),
          )
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          expect(screen.getByRole('status')).toBeInTheDocument()
        })
      })

      describe.each([{language: 'pl'}, {language: 'en'}])(
        'when language is $language',
        ({language}) => {
          it('should send expected language in accept language header', async () => {
            let acceptLanguage
            server.use(
              http.post(API_URL, async ({request}) => {
                acceptLanguage = request.headers.get('Accept-Language')
                return HttpResponse.error()
              }),
            )
            const {
              user,
              elements: {button},
            } = await initializeTestSetup()
            i18n.global.locale.value = language
            await user.click(button)
            await waitFor(() => {
              expect(acceptLanguage).toBe(language)
            })
          })
        },
      )

      describe('when success response is received', () => {
        it('displays message received from backend', async () => {
          server.use(
            http.post(API_URL, async () => {
              return HttpResponse.json({message: 'Check your email'})
            }),
          )
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          const text = await screen.findByText('Check your email')
          expect(text).toBeInTheDocument()
        })
      })

      describe('when network failure occurs', () => {
        const GENERIC_ERROR = 'Unexpected error occurred, please try again'
        it('displays generic error message', async () => {
          server.use(
            http.post(API_URL, () => {
              return HttpResponse.error()
            }),
          )
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          const text = await screen.findByText(GENERIC_ERROR)
          expect(text).toBeInTheDocument()
        })

        it('hides spinner', async () => {
          server.use(
            http.post(API_URL, () => {
              return HttpResponse.error()
            }),
          )
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          await waitFor(() => {
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
          })
        })

        describe('when user submits again', () => {
          it('hides error when api request in progress', async () => {
            let processedFirstRequest = false
            server.use(
              http.post(API_URL, () => {
                if (!processedFirstRequest) {
                  processedFirstRequest = true
                  return HttpResponse.error()
                } else {
                  return HttpResponse.json({message: 'Check your email'})
                }
              }),
            )
            const {
              user,
              elements: {button},
            } = await initializeTestSetup()
            await user.click(button)
            await screen.findByText(GENERIC_ERROR)
            await user.click(button)
            await waitFor(() => {
              expect(screen.queryByText(GENERIC_ERROR)).not.toBeInTheDocument()
            })
          })
        })
      })

      describe('when email is invalid', () => {
        beforeEach(() => {
          server.use(
            http.post(API_URL, () => {
              return HttpResponse.json(
                {
                  validationErrors: {
                    email: 'Invalid email',
                  },
                },
                {status: 400},
              )
            }),
          )
        })

        it('displays validation error', async () => {
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          const validationError = await screen.findByText('Invalid email')
          expect(validationError).toBeInTheDocument()
        })

        it('clears validation error after email field is updated', async () => {
          const {
            user,
            elements: {button, emailInput},
          } = await initializeTestSetup()
          await user.click(button)
          const validationError = await screen.findByText('Invalid email')
          await user.type(emailInput, 'Updated')
          expect(validationError).not.toBeInTheDocument()
        })
      })

      describe('when there is no validation error', () => {
        it('displays error returned from server', async () => {
          server.use(
            http.post(API_URL, () => {
              return HttpResponse.json({message: 'Unknown user'}, {status: 404})
            }),
          )
          const {
            user,
            elements: {button},
          } = await initializeTestSetup()
          await user.click(button)
          const error = await screen.findByText('Unknown user')
          expect(error).toBeInTheDocument()
        })
      })
    })
  })
})
