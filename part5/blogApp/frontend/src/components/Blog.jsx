import React, { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, handleLike, handleDelete, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${blog.title}?`)) {
      handleDelete(blog.id) 
    }
  }

  console.log('Current User:', currentUser)
  console.log('Blog User:', blog.user)

  return (
    <li className='blog'>
      <div>
        <strong>Title: {blog.title}</strong> Author: {blog.author}
        <button
          data-testid='toggle-details'
          onClick={toggleDetails}>
          {showDetails ? 'Hide' : 'View'}
        </button>
      </div>
      {showDetails && (
        <div>
          <p>{blog.url}</p>
          <p>{blog.votes} Votes</p>
          <button
            data-testid='like-button'
            onClick={() => handleLike(blog.id)}
            >Like
          </button>
          {blog.user && <p>Added by {blog.user.name}</p>}
          {currentUser && blog.user && currentUser.username === blog.user.username && (
            <button
              data-testid='delete-button'
              data-user-id={blog.user}
              onClick={confirmDelete}
              className="delete-button">
              Delete
            </button>
          )}
        </div>
      )}
    </li>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  currentUser: PropTypes.object
}

export default Blog
