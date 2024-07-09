const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')

describe('When there is initially some notes saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })
  
  test('Blogs are returned as json', async () => {
    await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  })
  
  test('Blog posts are returned as json and have an id property instead of _id', async () => {
      const response = await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
  
      const blog = response.body[0]
      assert(blog.id, 'The blog should have an id property')
      assert.strictEqual(blog._id, undefined, 'The blog should not have an _id property')
  })

  test('There are two blogs', async () => {
    const response = await helper.blogsInDb() 
    // console.log(response, helper.initialBlogs.length) 
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
          .expect(200)
          .expect('Content-Type', /application\/json/)
      
        assert.deepStrictEqual(resultBlog.body, blogToView)
    })

    test('Fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
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
        .expect(204)
    
      const blogsAtEnd = await helper.blogsInDb()
    
      const authors = blogsAtEnd.map(r => r.author)
      assert(!authors.includes(blogToDelete.author))
    
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })

  })
})



after(async () => {
  await mongoose.connection.close()
})