const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
    {
        author: 'auth1',
        title: 'title1',
        url: 'url1',
        votes: '1'
    },
    {
        author: 'auth2',
        title: 'title2',
        url: 'url2',
        votes: '2'
    },
]
  
beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
  
    assert.strictEqual(response.body.length, 2)
})
  
test('the first note is by auth1', async () => {
    const response = await api.get('/api/blogs')

    const authors = response.body.map(e => e.author)
    assert.strictEqual(authors.includes('auth1'), true)
})

after(async () => {
  await mongoose.connection.close()
})