const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    author: 'helper1',
    title: 'helper2',
    url: 'helper3',
    votes: '4'
  },
  {
    author: 'helper5',
    title: 'helper6',
    url: 'helper7',
    votes: '8'
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ author: 'willremovethissoon', title: 'willremovethissoon', url: 'willremovethissoon', })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb,
}