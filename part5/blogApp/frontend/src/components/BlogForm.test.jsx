import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const authorInput = screen.getByPlaceholderText('Enter author name')
  const titleInput = screen.getByPlaceholderText('Enter blog title')
  const urlInput = screen.getByPlaceholderText('Enter blog URL')
  const votesInput = screen.getByPlaceholderText('Enter initial votes')
  const sendButton = screen.getByText('save')

  await user.type(authorInput, 'testing author')
  await user.type(titleInput, 'testing title')
  await user.type(urlInput, 'http://testingurl.com')
  await user.type(votesInput, '10')
  await user.click(sendButton)

  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog).toHaveBeenCalledWith({
    author: 'testing author',
    title: 'testing title',
    url: 'http://testingurl.com',
    votes: 10
  })
})