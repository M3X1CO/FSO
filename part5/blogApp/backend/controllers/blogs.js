const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.put('/:id', async (request, response, next) => {
  const { author, title, url, votes } = request.body

  const blog = {
    author,
    title,
    url,
    votes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})

blogsRouter.post('/', async (request, response) => {
  try {
    const { author, title, url, votes } = request.body
    console.log('Request body:', request.body)

    const token = getTokenFrom(request)
    console.log('Token:', token)
    if (!token) {
      return response.status(401).json({ error: 'token missing' })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET)
    console.log('Decoded token:', decodedToken)

    if (!decodedToken || !decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)
    console.log('User:', user)

    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }

    const blog = new Blog({
      author,
      title,
      url,
      votes,
      user: user._id
    })
    console.log('Blog to be saved:', blog)

    const savedBlog = await blog.save()
    console.log('Saved blog:', savedBlog)

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    console.error('Error creating blog:', error)
    response.status(500).json({ error: 'internal server error' })
  }
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    console.error('Error fetching blog:', error)
    response.status(500).json({ error: 'internal server error' })
  }
})


blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter
