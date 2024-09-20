import {render, router, screen, waitFor} from 'test/helper'
import User from './UserPage.vue'
import {setupServer} from 'msw/node'
import {delay, http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach, vi} from 'vitest'

let userId
const setupTestServer = () => {
  return setupServer(
    http.get('/api/v1/users/:id', async ({params}) => {
      userId = params.id
      return HttpResponse.json({
        id: Number(userId),
        username: `user${userId}`,
        email: `user${userId}@mail.com`,
        image: null,
      })
    }),
  )
}

const initializeServerHandlers = () => {
  beforeAll(() => server.listen())
  beforeEach(() => {
    userId = undefined
    server.resetHandlers()
  })
  afterAll(() => server.close())
}

const confirmDialogSpy = vi.spyOn(window, 'confirm')

const setupTestPage = async (path) => {
  await router.push(path)
  await router.isReady()
  return render(User)
}

const setupPageLoaded = async (id = '3') => {
  const result = await setupTestPage(`/user/${id}`)
  // await screen.findByText(`user${id}`)
  await screen.findByTestId('h3-username')
  const deleteButton = screen.queryByRole('button', {name: 'Delete'})
  return {...result, elements: {deleteButton}}
}

initializeServerHandlers()

describe('User Page', () => {
  describe('when there is a logged in user', () => {
    beforeEach(() => {
      localStorage.setItem('auth', JSON.stringify({id: 3, username: 'user3'}))
    })

    describe('when user id matches the logged in user id', () => {
      it('displays delete button', async () => {
        const {
          elements: {deleteButton},
        } = await setupPageLoaded()
        expect(deleteButton).toBeInTheDocument()
      })

      describe('when user clicks delete button', () => {
        beforeEach(() => {
          confirmDialogSpy.mockReturnValue(false)
        })

        it('displays confirm dialog', async () => {
          const {
            user,
            elements: {deleteButton},
          } = await setupPageLoaded()
          await user.click(deleteButton)
          expect(confirmDialogSpy).toHaveBeenCalledWith('Are you sure?')
        })

        describe('when user confirms', () => {
          beforeEach(() => {
            confirmDialogSpy.mockReturnValue(true)
          })

          describe('when the result is an error', () => {
            it('displays a generic error message', async () => {
              server.use(
                http.delete('/api/v1/users/:id', async () => {
                  return HttpResponse.error()
                }),
              )
              const {
                user,
                elements: {deleteButton},
              } = await setupPageLoaded()
              await user.click(deleteButton)
              await waitFor(() => {
                expect(
                  screen.queryByText('Unexpected error occurred, please try again'),
                ).toBeInTheDocument()
              })
            })

            it('hides spinner', async () => {
              server.use(
                http.delete('/api/v1/users/:id', async () => {
                  return HttpResponse.error()
                }),
              )
              const {
                user,
                elements: {deleteButton},
              } = await setupPageLoaded()
              await user.click(deleteButton)
              await screen.findByText('Unexpected error occurred, please try again')
              expect(screen.queryByRole('status')).not.toBeInTheDocument()
            })

            describe('when user clicks again', () => {
              it('hides error message', async () => {
                let processedFirstRequest = false
                server.use(
                  http.delete('/api/v1/users/:id', async () => {
                    if (!processedFirstRequest) {
                      return HttpResponse.error()
                    } else {
                      await delay('infinite')
                      return HttpResponse.json({})
                    }
                  }),
                )
                const {
                  user,
                  elements: {deleteButton},
                } = await setupPageLoaded()
                await user.click(deleteButton)
                const error = await screen.findByText('Unexpected error occurred, please try again')
                await user.click(deleteButton)
                expect(error).not.toBeInTheDocument()
              })
            })
          })

          it.skip('sends delete request to backend', async () => {
            server.use(
              http.delete('/api/v1/users/:id', async ({params}) => {
                userId = params.id
                return HttpResponse.json({})
              }),
            )
            const {
              user,
              elements: {deleteButton},
            } = await setupPageLoaded()
            await user.click(deleteButton)
            await waitFor(() => {
              expect(userId).toBe('3')
            })
          })

          describe('when API request is in progress', () => {
            it('displays spinner', async () => {
              server.use(
                http.delete('/api/v1/users/:id', async () => {
                  await delay('infinite')
                  return HttpResponse.json({})
                }),
              )
              const {
                user,
                elements: {deleteButton},
              } = await setupPageLoaded()
              expect(screen.queryByRole('status')).not.toBeInTheDocument()
              await user.click(deleteButton)
              await waitFor(() => {
                expect(screen.queryByRole('status')).toBeInTheDocument()
              })
            })
          })

          describe('when the result is success', () => {
            it('navigates to home', async () => {
              server.use(
                http.delete('/api/v1/users/:id', async () => {
                  return HttpResponse.json({})
                }),
              )
              const {
                user,
                elements: {deleteButton},
              } = await setupPageLoaded()
              await user.click(deleteButton)
              await waitFor(() => {
                expect(router.currentRoute.value.path).toBe('/')
              })
            })

            it.skip('should log user out', async () => {
              server.use(
                http.delete('/api/v1/users/:id', async () => {
                  return HttpResponse.json({})
                }),
              )
              const {
                user,
                elements: {deleteButton},
              } = await setupPageLoaded()
              await user.click(deleteButton)
              await waitFor(() => {
                expect(JSON.parse(localStorage.getItem('auth')).id).toBe(0)
              })
            })
          })
        })

        describe('when user cancels', () => {
          it('stays on profile page', async () => {
            server.use(
              http.delete('/api/v1/users/:id', async () => {
                return HttpResponse.json({})
              }),
            )
            const {
              user,
              elements: {deleteButton},
            } = await setupPageLoaded()
            await user.click(deleteButton)
            await waitFor(() => {
              expect(router.currentRoute.value.path).toBe('/user/3')
            })
          })
        })
      })
    })

    describe('when user id does not match the logged in user id', () => {
      it('does not display delete button', async () => {
        const {
          elements: {deleteButton},
        } = await setupPageLoaded('1')
        expect(deleteButton).not.toBeInTheDocument()
      })
    })
  })
})

const server = setupTestServer()
