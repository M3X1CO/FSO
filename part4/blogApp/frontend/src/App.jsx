import React, { useState, useEffect } from 'react';
import blogService from './services/blogs';
import './App.css';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newVotes, setNewVotes] = useState('');
  const [expandedBlogId, setExpandedBlogId] = useState(null);

  useEffect(() => {
    blogService.getAll().then(initialBlogs => {
      setBlogs(initialBlogs);
    });
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
    console.log('Clicked blog id:', blogId);
    setExpandedBlogId(expandedBlogId === blogId ? null : blogId);
  };

  {expandedBlogId === blog._id && (
    <div>
      <p>URL: {blog.url}</p>
      <p>Votes: {blog.votes}</p>
    </div>
  )}

  return (
    <div>
      <h1>Blogs</h1>
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

      <h2>Blog List</h2>
      <ul>
        {blogs.map(blog => (
          <li key={blog._id}>
            {blog.title} by {blog.author}
            <button onClick={() => toggleBlogDetails(blog._id)}>
              {/* ... */}
            </button>
            {expandedBlogId === blog._id && (
              <div>
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
