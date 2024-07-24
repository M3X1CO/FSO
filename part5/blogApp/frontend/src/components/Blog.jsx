import React, { useState } from 'react'
import PropTypes from 'prop-types'

const BlogDetails = ({ blog, handleLike, handleDelete, currentUser }) => (
  <div className="blog-details">
    <p>URL: {blog.url}</p>
    <p>Votes: {blog.votes} <button data-testid='like-button' onClick={() => handleLike(blog.id)}>Like</button></p>
    {blog.user && <p>Added by {blog.user.name}</p>}
    {currentUser && blog.user && currentUser.username === blog.user.username && (
      <button
        data-testid='delete-button'
        onClick={() => handleDelete(blog.id)}
        className="delete-button">
        Delete
      </button>
    )}
  </div>
)

const Blog = ({ blog, handleLike, handleDelete, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => setShowDetails(!showDetails)

  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${blog.title}?`)) {
      handleDelete(blog.id)
    }
  }

  return (
    <article className='blog'>
      <div>
        <strong>Title: {blog.title}</strong> Author: {blog.author}
        <button data-testid='toggle-details' onClick={toggleDetails}>
          {showDetails ? 'Hide' : 'View'}
        </button>
      </div>
      {showDetails && (
        <BlogDetails 
          blog={blog} 
          handleLike={handleLike} 
          handleDelete={confirmDelete} 
          currentUser={currentUser}
        />
      )}
    </article>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    votes: PropTypes.number.isRequired,
    user: PropTypes.shape({
      username: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })
}

export default Blog