import React, { useState } from 'react'

const Blog = ({ blog }) => {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <li>
      {blog.title} by {blog.author}
      <button onClick={toggleDetails}>
        {showDetails ? 'Hide' : 'View'}
      </button>
      {showDetails && (
        <div>
          <p>{blog.url}</p>
          <p>{blog.votes} Votes</p>
        </div>
      )}
    </li>
  )
}

export default Blog
