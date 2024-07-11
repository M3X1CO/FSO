const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const helper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('When there is initially some notes saved', () => {
  let token = ''

  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'testuser', passwordHash })
    await user.save()

    const userForToken = {
      username: user.username,
      id: user._id,
    }
    token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

    const blogs = helper.initialBlogs.map(blog => ({ ...blog, user: user._id }))
    await Blog.insertMany(blogs)
  })

  test('Blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('Blog posts are returned as json and have an id property instead of _id', async () => {
    const response = await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blog = response.body[0]
    assert(blog.id, 'The blog should have an id property')
    assert.strictEqual(blog._id, undefined, 'The blog should not have an _id property')
  })

  test('There are two blogs', async () => {
    const response = await helper.blogsInDb()
    assert.strictEqual(response.length, helper.initialBlogs.length)
  })

  test('Find if author is in DB', async () => {
    const response = await helper.blogsInDb()
    const authors = response.map(e => e.author)
    assert.strictEqual(authors.includes('helper1'), true)
  })

  describe('Viewing a specific Blog', () => {
    test('Succeeds with a specific id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const resultBlogBody = {
        ...resultBlog.body,
        user: resultBlog.body.user.toString()
      }

      const expectedBlog = {
        ...blogToView,
        user: blogToView.user.toString()
      }

      assert.deepStrictEqual(resultBlogBody, expectedBlog)
    })

    test('Fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)
    })
  })

  describe('Addition of a new blog', () => {
    test('A valid blog can be added', async () => {
      const newBlog = {
        author: 'testAuth1',
        title: 'testTitle1',
        url: 'testUrl1',
        votes: '5'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await helper.blogsInDb()
      assert.strictEqual(response.length, helper.initialBlogs.length + 1)

      const authors = response.map(r => r.author)
      assert(authors.includes('testAuth1'))
    })

    test('Blog without title or url is not added', async () => {
      const newBlog = {
        author: 'fyodor'
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      // console.log('Blogs in DB after attempt to add invalid blog: ', blogsAtEnd)

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('Deleteion of a blog', () => {
    test('A blog can be deleted', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      const authors = blogsAtEnd.map(r => r.author)
      assert(!authors.includes(blogToDelete.author))

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })

  describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
      await user.save()

      const userForToken = {
        username: user.username,
        id: user._id,
      }
      token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root', // Existing username in the database
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      console.log(result.body) // Log the response body to inspect the error message

      assert(result.body.error.includes('username must be unique')) // Adjust this assertion based on the logged response

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length) // No new user should be added
    })

    test('creation fails with proper statuscode and message if username or password is too short', async () => {
      const newUser = {
        username: 'us',
        name: 'New User',
        password: 'pw',
      }

      const result = await api
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('username and password must be at least 3 characters long'))

      const users = await User.find({})
      assert.strictEqual(users.length, 1) // Assuming only 'root' user exists initially
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})