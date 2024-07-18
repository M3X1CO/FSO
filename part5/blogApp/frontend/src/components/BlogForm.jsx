import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    author: '',
    title: '',
    url: '',
    votes: 0
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setNewBlog({
      ...newBlog,
      [name]: value
    })
  }

  const addBlog = (event) => {
    event.preventDefault()
    createBlog(newBlog)
    setNewBlog({
      author: '',
      title: '',
      url: '',
      votes: 0
    })

    setNewAuthor('')
    setNewTitle('')
    setNewUrl('')
    setNewVotes('')
  }

  return (
    <div>
      <h2>Create a new blog</h2>

      <form onSubmit={addBlog}>
        <div>
          <label>Author:</label>
          <input
            name="author"
            value={newBlog.author}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Title:</label>
          <input
            name="title"
            value={newBlog.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>URL:</label>
          <input
            name="url"
            value={newBlog.url}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Votes:</label>
          <input
            name="votes"
            type="number"
            value={newBlog.votes}
            onChange={handleChange}
          />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default BlogForm
