import React, { useState, useEffect } from 'react';
import blogService from './services/blogs'; // Assuming blogService handles API calls

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newVotes, setNewVotes] = useState('');
  const [expandedBlogId, setExpandedBlogId] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll();
      setBlogs(initialBlogs);
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

    const returnedBlog = await blogService.create(blogObject);
    setBlogs(blogs.concat(returnedBlog));
    setNewAuthor('');
    setNewTitle('');
    setNewUrl('');
    setNewVotes('');
  };

  const toggleBlogDetails = (blogId) => {
    setExpandedBlogId(expandedBlogId === blogId ? null : blogId);
  };

  return (
    <div className="app-container">
      <h1>Blogs</h1>
      <form onSubmit={addBlog}>
        <div className="form-group">
          <label htmlFor="authorInput">Author:</label>
          <input
            id="authorInput"
            name="author"
            value={newAuthor}
            onChange={({ target }) => setNewAuthor(target.value)}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="titleInput">Title:</label>
          <input
            id="titleInput"
            name="title"
            value={newTitle}
            onChange={({ target }) => setNewTitle(target.value)}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="urlInput">URL:</label>
          <input
            id="urlInput"
            name="url"
            value={newUrl}
            onChange={({ target }) => setNewUrl(target.value)}
            autoComplete="off"
          />
        </div>
        <div className="form-group">
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

      <h2>Blog List</h2>
      <ul className="blog-list">
        {blogs.map((blog) => (
          <li key={blog._id} className="blog-item">
            <div className="blog-info">
              <h3>{blog.title}</h3>
              <p>by {blog.author}</p>
            </div>
            <button
              onClick={() => toggleBlogDetails(blog._id)}
              className="toggle-button"
            >
              {expandedBlogId === blog._id ? 'Hide Details' : 'Show Details'}
            </button>
            {expandedBlogId === blog._id && (
              <div className="blog-details">
                <p>URL: {blog.url}</p>
                <p>Votes: {blog.votes}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
