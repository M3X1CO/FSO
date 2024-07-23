import React, { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${blog.title}?`)) {
      handleDelete(blog.id)
    }
  }

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
          <button
            data-testid='delete-button'
            onClick={confirmDelete}
            className="delete-button"
            >Delete
          </button>
        </div>
      )}
    </li>
  )
}

export default Blog
