const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

const initialBlogs = [
    {
      author: 'Test subject',
      title: 'Tested',
      url: 'Test.com',
      votes: '1'
    },
    {
      author: 'Test subject2',
      title: 'Tested2',
      url: 'Test2.com',
      votes: '2'
    }
];
  

beforeEach(async () => {
await Blog.deleteMany({})
let blogObject = new Blog(initialBlogs[0])
await blogObject.save()
blogObject = new Blog(initialBlogs[1])
await blogObject.save()
})

test('a valid blog can be added', async () => {
    const newBlog = {
      author: 'New Test subject',
      title: 'New Tested',
      url: 'NewTest.com',
      votes: '3'
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    const response = await api.get('/api/blogs');
    const authors = response.body.map(blog => blog.author);
  
    assert.strictEqual(response.body.length, initialBlogs.length + 1);
    assert(authors.includes('New Test subject'));
});  

after(async () => {
  await mongoose.connection.close()
})