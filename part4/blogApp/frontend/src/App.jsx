import { useState, useEffect } from 'react'
import blogService from './services/blogs'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState('')
  const [showAll, setShowAll] = useState(true)

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
      content: newBlog,
      important: Math.random() > 0.5,
    }
  
    blogService
      .create(blogObject)
        .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setNewBlog('')
      })
  }

  return (
    <div>
      <h1>Blogs</h1>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>      
      <form onSubmit={addBlog}>
      <input
          id="blogInput"
          name="blog"
          value={newBlog}
          autoComplete="off"
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default App