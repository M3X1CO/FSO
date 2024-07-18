import React, { useState } from 'react'

const Blog = ({ blog, handleLike, userName }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <li>
      {blog.title} {blog.author}
      <button onClick={toggleDetails}>
        {showDetails ? 'Hide' : 'View'}
      </button>
      {showDetails && (
        <div>
          <p>{blog.url}</p>
          <p>{blog.votes} Votes</p>
          <button onClick={() => handleLike(blog.id)}>Like</button>
          <p>Added by: {userName}</p>
        </div>
      )}
    </li>
  )
}

export default Blog
