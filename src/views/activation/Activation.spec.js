import {render, waitFor} from 'test/helper'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach} from 'vitest'
import Activation from './ActivationView.vue'

let counter = 0
const server = setupServer(
  http.patch('/api/v1/users/:token/active', () => {
    counter += 1
    return HttpResponse.json({})
  }),
)

beforeEach(() => {
  counter = 0
  server.resetHandlers()
})

beforeAll(() => server.listen())

afterAll(() => server.close())

describe('Activation', () => {
  it('sends activation request to server', async () => {
    render(Activation)
    await waitFor(() => {
      expect(counter).toBe(1)
    })
  })
})
