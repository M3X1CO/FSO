import { useState, useEffect } from 'react';
import Notification from './components/Notification'
import Footer from './components/Footer'
import blogService from './services/blogs';
import loginService from './services/login'
import './App.css';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newVotes, setNewVotes] = useState('');
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    blogService
      .getAll()
      .then(initialBlogs => {
        setBlogs(initialBlogs);
      });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = (event) => {
    event.preventDefault();
    const blogObject = {
      author: newAuthor,
      title: newTitle,
      url: newUrl,
      votes: newVotes
    };

    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog));
        setNewAuthor('');
        setNewTitle('');
        setNewUrl('');
        setNewVotes('');
      });
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
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

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
  )

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
  )

  return (
    <div>
      <h1>Blogs</h1>

      <Notification message={errorMessage} />

      {user === null ?
      loginForm() :
      <div>
        <p>{user.name} logged-in</p>
        {blogForm()}
      </div>
      }

      <h2>Blog List</h2>
      <ul>
        {blogs.map(blog => (
          <li key={blog._id}>
            {blog.title} by {blog.author}
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  );
};

export default App;
