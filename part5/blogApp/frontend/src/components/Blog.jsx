import React from 'react'

const Blog = ({ blog }) => (
  <li>
    {blog.title} by {blog.author}
  </li>
)

export default Blog
