const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
  console.log('Setting token:', token); // Debugging log
};

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const config = {
    headers: { Authorization: token },
  };
  const blog = await Blog.findById(request.params.id, config)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

// try {
//   const config = {
//     headers: { Authorization: token },
//   };
//   const response = await axios.get(baseUrl, config);
//   return response.data;
// } catch (error) {
//   console.error('Error fetching all blogs:', error.response || error.message); // Debugging log
//   throw error;
// }


blogsRouter.post('/', async (request, response) => {
  const { author, title, url, votes } = request.body
  const user = request.user

  const blog = new Blog({
    author: author,
    title: title,
    url: url,
    votes: votes,
    user: user.id
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const blogId = request.params.id
  const user = request.user

  const blog = await Blog.findById(blogId)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user.id) {
    return response.status(401).json({ error: 'only the creator of this blog can delete' })
  }

  await Blog.findByIdAndDelete(blogId)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { author, title, url, votes } = request.body

  const blog = {
    author: author,
    title: title,
    url: url,
    votes: votes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter
