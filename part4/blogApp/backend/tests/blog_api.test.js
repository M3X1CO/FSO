const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
  
beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
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

test('A valid blog can be added ', async () => {
    const newBlog = {
        author: 'testAuth1',
        title: 'testTitle1',
        url: 'testUrl1',
        votes: '5'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await helper.blogsInDb()
    assert.strictEqual(response.length, helper.initialBlogs.length + 1)
  
    const authors = response.map(r => r.author)
    assert(authors.includes('testAuth1'))
})

test('Blog without content is not added', async () => {
    const newBlog = {
      author: 'fyodor'
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
    // console.log('Blogs in DB after attempt to add invalid blog: ', blogsAtEnd)
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('A specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
  
    const blogToView = blogsAtStart[0]
  
  
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    assert.deepStrictEqual(resultBlog.body, blogToView)
  })
  
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
  
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    const authors = blogsAtEnd.map(r => r.author)
    assert(!authors.includes(blogToDelete.author))
  
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
  })

after(async () => {
  await mongoose.connection.close()
})