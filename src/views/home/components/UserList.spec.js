import {render, screen, waitFor} from 'test/helper'
import UserList from './UserList.vue'
import {setupServer} from 'msw/node'
import {http, HttpResponse} from 'msw'
import {afterAll, beforeAll, beforeEach} from 'vitest'

const users = [
  {id: 1, username: 'user1', email: 'user1@mail.com'},
  {id: 2, username: 'user2', email: 'user2@mail.com'},
  {id: 3, username: 'user3', email: 'user3@mail.com'},
  {id: 4, username: 'user4', email: 'user4@mail.com'},
  {id: 5, username: 'user5', email: 'user5@mail.com'},
  {id: 6, username: 'user6', email: 'user6@mail.com'},
  {id: 7, username: 'user7', email: 'user7@mail.com'},
]

const getPage = (page, size) => {
  const start = page * size
  const end = start + size
  return {
    content: users.slice(start, end),
    page,
    size,
    totalPages: Math.ceil(Math.ceil(page / size)),
  }
}

const USER_API_URL = '/api/v1/users'

const server = setupServer(
  http.get(USER_API_URL, ({request}) => {
    const url = new URL(request.url)
    const size = Number.parseInt(url.searchParams.get('size')) || 5
    const page = Number.parseInt(url.searchParams.get('page')) || 0
    return HttpResponse.json(getPage(page, size))
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
