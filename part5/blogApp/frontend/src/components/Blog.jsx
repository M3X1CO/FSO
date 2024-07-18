import React, { useState } from 'react'

const Blog = ({ blog, handleLike, userName }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

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
          {userName && <p>Added by {userName}</p>}
        </div>
      )}
    </li>
  )
}

export default Blog
