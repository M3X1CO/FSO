import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders blog title and author, but does not render URL or number of likes by default', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'John Doe',
    url: 'https://example.com',
    votes: 10,
    id: '1',
    user: { name: 'Jane Doe' }
  }

  render(<Blog blog={blog} handleLike={() => {}} handleDelete={() => {}} />)

  screen.debug()
  const titleElement = screen.getByText('Component testing is done with react-testing-library', { exact: false })
  const authorElement = screen.getByText('John Doe', { exact: false })
  screen.debug(titleElement, authorElement)

  expect(titleElement).toBeInTheDocument()
  expect(authorElement).toBeInTheDocument()

  const urlElement = screen.queryByText('https://example.com')
  const votesElement = screen.queryByText('10 Votes')

  expect(urlElement).not.toBeInTheDocument()
  expect(votesElement).not.toBeInTheDocument()
})

test('toggles blog details visibility', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'John Doe',
    url: 'http://example.com',
    votes: 10,
    user: { name: 'Jane Doe' },
    id: '1'
  }

  render(<Blog blog={blog} handleLike={() => {}} handleDelete={() => {}} />)

  const user = userEvent.setup()

  expect(screen.queryByText('http://example.com')).not.toBeInTheDocument()
  expect(screen.queryByText('10 Votes')).not.toBeInTheDocument()
  expect(screen.queryByText('Like')).not.toBeInTheDocument()
  expect(screen.queryByText('Added by Jane Doe')).not.toBeInTheDocument()

  const viewButton = await screen.findByText('View')
  await user.click(viewButton)

  expect(await screen.findByText('http://example.com')).toBeInTheDocument()
  expect(await screen.findByText('10 Votes')).toBeInTheDocument()
  expect(await screen.findByText('Like')).toBeInTheDocument()
  expect(await screen.findByText('Added by Jane Doe')).toBeInTheDocument()

  const hideButton = await screen.findByText('Hide')
  await user.click(hideButton)

  expect(screen.queryByText('http://example.com')).not.toBeInTheDocument()
  expect(screen.queryByText('10 Votes')).not.toBeInTheDocument()
  expect(screen.queryByText('Like')).not.toBeInTheDocument()
  expect(screen.queryByText('Added by Jane Doe')).not.toBeInTheDocument()
})


test('calls handleLike when like button is clicked twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'John Doe',
    url: 'http://example.com',
    votes: 10,
    user: { name: 'Jane Doe' },
    id: '1'
  }
  const handleLike = vi.fn()

  render(<Blog blog={blog} handleLike={handleLike} handleDelete={() => {}} />)

  const user = userEvent.setup()

  const viewButton = await screen.findByText('View')
  await user.click(viewButton)

  const likeButton = await screen.findByText('Like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(handleLike).toHaveBeenCalledTimes(2)
  expect(handleLike).toHaveBeenCalledWith('1')
})

test('calls handleDelete when delete button is clicked after confirmation', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'John Doe',
    url: 'http://example.com',
    votes: 10,
    user: { name: 'Jane Doe' },
    id: '1'
  }
  const handleDelete = vi.fn()
  
  render(<Blog blog={blog} handleDelete={handleDelete} />)

  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockImplementation(() => true)
  const viewButton = await screen.findByText('View')
  await user.click(viewButton)
  const deleteButton = await screen.findByText('Delete')
  await user.click(deleteButton)

  expect(handleDelete).toHaveBeenCalledWith('1')

  // Clean up
  window.confirm.mockRestore()
})