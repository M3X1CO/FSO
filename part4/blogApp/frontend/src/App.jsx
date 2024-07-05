import { useState, useEffect } from 'react'
import blogService from './services/blogs'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newAuthor, setNewAuthor] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newVotes, setNewVotes] = useState('')

  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => {
        setBlogs(initialBlogs)
      })
  }, [])

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      author: newAuthor,
      title: newTitle,
      url: newUrl,
      votes: newVotes
    }
  
    blogService
      .create(blogObject)
        .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setNewAuthor('')
        setNewTitle('')
        setNewUrl('')
        setNewVotes('')
      })
  }

  return (
    <div>
      <h1>Save yer Blogs</h1>    
      <form onSubmit={addBlog}>
        <div>
          <label htmlFor="authorInput">Author:</label>
          <input
              id="authorInput"
              name="author"
              value={newAuthor}
              onChange={({ target }) => setNewAuthor(target.value)}
              autoComplete="off"
            />
        </div>
        <div>
          <label htmlFor="titleInput">Title:</label>
          <input
              id="titleInput"
              name="title"
              value={newTitle}
              onChange={({ target }) => setNewTitle(target.value)}
              autoComplete="off"
            />
        </div>
        <div>
          <label htmlFor="urlInput">URL:</label>
          <input
              id="urlInput"
              name="url"
              value={newUrl}
              onChange={({ target }) => setNewUrl(target.value)}
              autoComplete="off"
            />
        </div>
        <div>
          <label htmlFor="votesInput">Votes:</label>
          <input
              id="votesInput"
              name="votes"
              value={newVotes}
              onChange={({ target }) => setNewVotes(target.value)}
              autoComplete="off"
            />
        </div>
        <button type="submit">save</button>
      </form>

      <h2>Blog List</h2>
      <ul>
        {blogs.map(blog => {
          <li key={blog.id}>{blog.title} by {blog.author}</li>
        })}
      </ul>
    </div>
  )
}

export default App