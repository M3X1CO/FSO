import { useState, useEffect } from 'react';
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
  const [blogsFetched, setBlogsFetched] = useState(false); // New state variable

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');
    console.log('Retrieved loggedUserJSON:', loggedUserJSON); // Debugging log
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      console.log('Parsed user from localStorage:', user); // Debugging log
      setUser(user);
      blogService.setToken(user.token);
      console.log('Token set in blogService:', user.token); // Debugging log
    }
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const initialBlogs = await blogService.getAll();
        setBlogs(initialBlogs);
        setBlogsFetched(true); // Update state to indicate blogs are fetched
      } catch (error) {
        console.error('Error fetching blogs:', error);
        // Handle error or set state accordingly
      }
    };

    fetchBlogs();
  }, []);

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
    event.preventDefault();
    
    try {
      const user = await loginService.login({ username, password });
  
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));
      blogService.setToken(user.token);
      console.log('Logged in user:', user); // Debugging log
      setUser(user);
      setUsername('');
      setPassword('');
      setBlogsFetched(false); // Reset blogsFetched to false to trigger re-fetch of blogs
    } catch (exception) {
      setNotification({ message: 'Wrong credentials', type: 'error' });
      setTimeout(() => {
        setNotification({ message: null, type: '' });
      }, 5000);
    }
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

  const renderBlogs = () => (
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
      <h1>Blogs</h1>

      <Notification message={notification.message} type={notification.type} />

      {user === null ?
        loginForm() :
        <div>
          <p>{user.name} logged-in</p>
          {blogForm()}
        </div>
      }

      {blogsFetched && renderBlogs()} {/* Render blogs only if fetched */}

      <Footer />
    </div>
  );
};

export default App;
