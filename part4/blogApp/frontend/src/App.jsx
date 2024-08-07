import { useState, useEffect } from 'react'
import Notification from './components/Notification'
import Footer from './components/Footer'
import blogService from './services/blogs'
import LoginForm from './components/LoginForm'
import loginService from './services/login'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newAuthor, setNewAuthor] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newVotes, setNewVotes] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => {
        setBlogs(initialBlogs)
      })
  }, [])

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      author: newAuthor,
      title: newTitle,
      url: newUrl,
      votes: newVotes,
    }

    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setNewAuthor('')
      setNewTitle('')
      setNewUrl('')
      setNewVotes('')
    } catch (exception) {
      setErrorMessage('Error adding blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleAuthorChange = (event) => setNewAuthor(event.target.value)
  const handleTitleChange = (event) => setNewTitle(event.target.value)
  const handleUrlChange = (event) => setNewUrl(event.target.value)
  const handleVotesChange = (event) => setNewVotes(event.target.value)

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const blogsToShow = blogs

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  const blogForm = () => (
    <form onSubmit={addBlog}>
      <div>
        <label>Author</label>
        <input
          value={newAuthor}
          onChange={handleAuthorChange}
        />
      </div>
      <div>
        <label>Title</label>
        <input
          value={newTitle}
          onChange={handleTitleChange}
        />
      </div>
      <div>
        <label>URL</label>
        <input
          value={newUrl}
          onChange={handleUrlChange}
        />
      </div>
      <div>
        <label>Votes</label>
        <input
          value={newVotes}
          onChange={handleVotesChange}
        />
      </div>
      <button type="submit">save</button>
    </form>
  )

  return (
    <div>
      <h1>Blogs</h1>
      <Notification message={errorMessage} />

      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          <Togglable buttonLabel="New Blog">
            {blogForm()}
          </Togglable>
        </div>
      )}
      <ul>
        {blogsToShow.map(blog => (
          <li key={blog.id}>
            {blog.title} by {blog.author}
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  )
}

export default App
