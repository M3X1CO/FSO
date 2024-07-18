import React, { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${blog.title}?`)) {
      handleDelete(blog.id);
    }
  };

  return (
    <li>
      <div>
        <strong>{blog.title}</strong> {blog.author}
        <button onClick={toggleDetails}>
          {showDetails ? 'Hide' : 'View'}
        </button>
      </div>
      {showDetails && (
        <div>
          <p>{blog.url}</p>
          <p>{blog.votes} Votes</p>
          <button onClick={() => handleLike(blog.id)}>Like</button>
          {blog.user && <p>Added by {blog.user.name}</p>}
          <button onClick={confirmDelete} style={{ 
            marginLeft: '1rem', 
            backgroundColor: 'red', 
            color: 'white', 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}>
            Delete
          </button>
        </div>
      )}
    </li>
  )
}

export default Blog
