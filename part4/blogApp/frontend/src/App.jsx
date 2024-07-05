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
      <h1>Blogs</h1>    
      <form onSubmit={addBlog}>
      <div>
        <input
            id="blogInput"
            name="blog"
            value={newAuthor}
            autoComplete="off"
          />
          <button type="submit">save</button>
      </div>
      <div>
        <input
            id="blogInput"
            name="blog"
            value={newTitle}
            autoComplete="off"
          />
          <button type="submit">save</button>
      </div>
      <div>
        <input
            id="blogInput"
            name="blog"
            value={newUrl}
            autoComplete="off"
          />
          <button type="submit">save</button>
      </div>
      <div>
        <input
            id="blogInput"
            name="blog"
            value={newVotes}
            autoComplete="off"
          />
          <button type="submit">save</button>
      </div>
      </form>
    </div>
  )
}

export default App