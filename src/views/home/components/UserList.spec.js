import {render, screen, waitFor} from 'test/helper'
import UserList from './UserList.vue'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach} from 'vitest'

const mockedUserList = {
  content: [
    {id: 1, username: 'user1', email: 'user1@mail.com'},
    {id: 2, username: 'user2', email: 'user2@mail.com'},
    {id: 3, username: 'user3', email: 'user3@mail.com'},
  ],
  page: 0,
  size: 3,
  totalPages: 9,
}

const USER_API_URL = '/api/v1/users'

const server = setupServer(
  http.get(USER_API_URL, () => {
    return HttpResponse.json(mockedUserList)
  }),
)

const setupMockServer = () => {
  beforeEach(() => server.resetHandlers())
  beforeAll(() => server.listen())
  afterAll(() => server.close())
}

setupMockServer()

describe('UserList', () => {
  it('displays three users in list', async () => {
    render(UserList)
    await waitFor(() => {
      expect(screen.queryAllByText(/user\d/).length).toBe(3)
    })
  })
})
