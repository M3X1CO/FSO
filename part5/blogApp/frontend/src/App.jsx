import React, { useState, useEffect, useRef } from 'react'
import Notification from './components/Notification'
import Footer from './components/Footer'
import blogService from './services/blogs'
import LoginForm from './components/LoginForm'
import loginService from './services/login'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import Blog from './components/Blog'
import LogoutButton from './components/LogoutButton'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    if (user) {
      blogService.getAll().then(initialBlogs => {
        initialBlogs.sort((a, b) => b.votes - a.votes)
        setBlogs(initialBlogs)
      })
    }
  }, [user])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong Credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
    setBlogs([]) // Clear blogs when logging out
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService.create(blogObject).then(returnedBlog => {
      setBlogs(prevBlogs => [...prevBlogs, returnedBlog].sort((a, b) => b.votes - a.votes))
    })
  }

  const likeBlog = async (id) => {
    try {
      const blogToLike = blogs.find(b => b.id === id)
      const likedBlog = { ...blogToLike, votes: blogToLike.votes + 1 }

      const updatedBlog = await blogService.update(id, likedBlog)

      const updatedBlogWithUser = { ...updatedBlog, user: blogToLike.user }

      setBlogs(prevBlogs => 
        prevBlogs.map(b => (b.id === id ? updatedBlogWithUser : b))
          .sort((a, b) => b.votes - a.votes)
      )

    } catch (error) {
      console.error('Error liking blog:', error)
    }
  }

  const deleteBlog = async id => {
    try {
      if (!id) {
        throw new Error('Blog ID is missing')
      }
      await blogService.remove(id)
      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== id))
    } catch (error) {
      console.error('Error deleting blog:', error)
    }
  }

  const loginForm = () => (
    <Togglable buttonLabel="log in">
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  return (
    <div>
      <h1>Blogs</h1>
      <Notification message={errorMessage} />
      {!user && loginForm()}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          <LogoutButton onLogout={handleLogout} />
          <Togglable buttonLabel="New Blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
        </div>
      )}
      {user && (
        <ul>
          {blogs.map(blog => (
            <Blog 
              key={blog.id} 
              blog={blog} 
              handleLike={likeBlog} 
              handleDelete={deleteBlog} 
              currentUser={user}
            />
          ))}
        </ul>
      )}
      <Footer />
    </div>
  )
}

export default App