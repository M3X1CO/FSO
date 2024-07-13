import React, { useState, useEffect } from 'react';
import Notification from './components/Notification';
import Footer from './components/Footer';
import blogService from './services/blogs';
import loginService from './services/login';
import './App.css';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newVotes, setNewVotes] = useState('');
  const [notification, setNotification] = useState({ message: null, type: '' });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
      setIsLoggedIn(true); // User is logged in
    }
  }, []); // Only run once on mount

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch blogs when user logs in or when isLoggedIn changes
      blogService.getAll().then(initialBlogs => {
        setBlogs(initialBlogs);
      });
    }
  }, [isLoggedIn]); // Watch for changes in isLoggedIn state

  const addBlog = async (event) => {
    event.preventDefault();
    const blogObject = {
      author: newAuthor,
      title: newTitle,
      url: newUrl,
      votes: newVotes,
    };

    try {
      const returnedBlog = await blogService.create(blogObject);
      setBlogs(blogs.concat(returnedBlog));
      setNewAuthor('');
      setNewTitle('');
      setNewUrl('');
      setNewVotes('');
      setNotification({ message: `Added new blog: ${returnedBlog.title} by ${returnedBlog.author}`, type: 'success' });
      setTimeout(() => {
        setNotification({ message: null, type: '' });
      }, 5000);
    } catch (exception) {
      setNotification({ message: 'Error adding blog', type: 'error' });
      setTimeout(() => {
        setNotification({ message: null, type: '' });
      }, 5000);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({
        username, password,
      })
  
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setIsLoggedIn(true); // Set isLoggedIn to true after successful login
    } catch (exception) {
      setNotification({ message: 'Wrong credentials', type: 'error' });
      setTimeout(() => {
        setNotification({ message: null, type: '' });
      }, 5000);
    }
  }

  const handleLogout = () => {
    // Clear user data from localStorage and reset state
    window.localStorage.removeItem('loggedBlogappUser');
    blogService.setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );

  const blogForm = () => (
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
      <button type="submit">Save</button>
    </form>
  );

  const renderBlogList = () => (
    <div>
      <h2>Blog List</h2>
      <ul>
        {blogs.map(blog => (
          <li key={blog._id}>
            {blog.title} by {blog.author}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <h1>{isLoggedIn ? 'Blogs' : 'Login'}</h1>

      <Notification message={notification.message} type={notification.type} />

      {user === null ?
        loginForm() :
        <div>
          <p className="logged-in">{user.name} logged-in <button onClick={handleLogout}>Logout</button></p>
          {blogForm()}
        </div>
      }

      {isLoggedIn && renderBlogList()}

      <Footer />
    </div>
  );
};

export default App;
