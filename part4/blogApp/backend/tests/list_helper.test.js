// const { test, after, describe, beforeEach } = require('node:test')
// const assert = require('assert')
// const mongoose = require('mongoose')
// const supertest = require('supertest')
// const config = require('../utils/config')
// const listHelper = require('../utils/list_helper')
// const Blog = require('../models/blog')

// require('dotenv').config();

// async function connectToDB() {
//   try {
//     await mongoose.connect(config.MONGODB_URI, {
//     });
//     console.log('Connected to MongoDB database');
//   } catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//   }
// }

// async function disconnectFromDB() {
//   try {
//     await mongoose.disconnect();
//     console.log(`Disconnected from MongoDB database`);
//   } catch (error) {
//     console.error(`Error disconnecting from MongoDB database`, error);
//   }
// }

// describe('Blog Tests', () => {
//   test('dummy returns one', () => {
//     console.log(`Dummy Test`)
//     const blogs = [];
//     const result = listHelper.dummy(blogs);
//     assert.strictEqual(result, 1);
//   });

//   test('Create new blog post Database functionality', async () => {
//     await connectToDB();
//     await Blog.deleteMany({})
//     console.log(`Database cleared`)

//     const newBlog = new Blog({
//       author: 'newAuthor',
//       title: 'newTitle',
//       url: 'newUrl',
//       votes: 1,
//     });

//     const savedBlog = await newBlog.save();
//     assert.strictEqual(savedBlog.author, 'newAuthor');
//     assert.strictEqual(savedBlog.title, 'newTitle');

//     await disconnectFromDB();
//     console.log(`Testing DB functionality`)
//   });

//   test('Calculate sum of empty list', async () => {
//     await connectToDB();
//     await Blog.deleteMany({});
//     console.log('Database cleared');

//     const blogs = [];

//     const total = listHelper.totalVotes(blogs);
//     assert.strictEqual(total, 0); 

//     await disconnectFromDB();
//     console.log(`Testing sum of empty list`)
//   });

//   test('Calculate sum of likes when list is a single blog', async () => {
//     await connectToDB();
//     await Blog.deleteMany({});
//     console.log('Database cleared');

//     const newBlog = new Blog({
//       author: 'newAuthor',
//       title: 'newTitle',
//       url: 'newUrl',
//       votes: '5',
//     });

//     await newBlog.save();

//     const total = listHelper.totalVotes([newBlog]);
//     assert.strictEqual(total, 5);

//     await disconnectFromDB();
//     console.log(`Testing sum of single entry list`)
//   });

//   test('Calculate total votes for multiple blogs', async () => {
//     await connectToDB();
//     await Blog.deleteMany({});
//     console.log('Database cleared');

//     const blogs = [
//       {
//         author: 'Fake Author 1',
//         title: 'Fake Title 1',
//         url: 'https://fakeurl1.com',
//         votes: '3',
//       },
//       {
//         author: 'Fake Author 2',
//         title: 'Fake Title 2',
//         url: 'https://fakeurl2.com',
//         votes: '12',
//       },
//       {
//         author: 'Fake Author 2',
//         title: 'Fake Title 2.2',
//         url: 'https://fakeurl212.com',
//         votes: '8',
//       },
//       {
//         author: 'Fake Author 3',
//         title: 'Fake Title 3',
//         url: 'https://fakeurl3.com',
//         votes: '5',
//       },
//       {
//         author: 'Fake Author 3',
//         title: 'Fake Title 3.3',
//         url: 'https://fakeurl313.com',
//         votes: '6',
//       },
//       {
//         author: 'Fake Author 3',
//         title: 'Fake Title 3.3.3',
//         url: 'https://fakeurl31313.com',
//         votes: '100',
//       },
//       {
//         author: 'Fake Author 4',
//         title: 'Fake Title 4',
//         url: 'https://fakeurl4.com',
//         votes: '5',
//       },
//       {
//         author: 'Fake Author 5',
//         title: 'Fake Title 5',
//         url: 'https://fakeurl5.com',
//         votes: '6',
//       },
//     ];

//     await Blog.insertMany(blogs);

//     const allBlogs = await Blog.find({})
//     const totalVotes = listHelper.totalVotes(allBlogs);

//     const expectedTotalVotes = allBlogs.reduce((sum, blog) => sum + Number(blog.votes), 0)
//     assert.strictEqual(totalVotes, expectedTotalVotes);

//     await disconnectFromDB();
//     console.log(`Testing sum of full list`)
//   });
// });

// describe('Favorite Blog', () => {
//   test('Return the blog with the most votes', async () => {
//     await connectToDB();
//     console.log('Searching Database');

//     const blogs = await Blog.find({});
//     const result = listHelper.favoriteBlog(blogs);
//     const expected = blogs.reduce((prev, current) => (Number(prev.votes) > Number(current.votes) ? prev : current));

//     assert.deepStrictEqual(result, {
//       title: expected.title,
//       author: expected.author,
//       votes: expected.votes
//     });

//     await disconnectFromDB();
//     console.log('Testing favorite blog');
//     console.log(`Expected: ${expected.title}\nReturned Title: ${result.title}\nAuthor: ${result.author}\nLikes: ${result.votes}`);
//   });
// });

// describe('Most Blogs', () => {
//   test('Return the author with the most blogs', async () => {
//     await connectToDB();
//     console.log('Searching Database');

//     const blogs = await Blog.find({});
//     const result = listHelper.mostBlogs(blogs);

//     const authorBlogCounts = blogs.reduce((acc, blog) => {
//       acc[blog.author] = (acc[blog.author] || 0) + 1;
//       return acc;
//     }, {});

//     const topAuthor = Object.keys(authorBlogCounts).reduce((a, b) => (authorBlogCounts[a] > authorBlogCounts[b] ? a : b));

//     const expected = {
//       author: topAuthor,
//       blogs: authorBlogCounts[topAuthor],
//     };

//     assert.deepStrictEqual(result, expected);

//     await disconnectFromDB();
//     console.log('Testing most blogs');
//     console.log(`Expected ${expected.author}\nReturned Author: ${result.author}\nBlogs: ${result.blogs}`);
//   });
// });

// describe('Most Likes', () => {
//   test('Return the author with the most likes', async () => {
//     await connectToDB();
//     console.log('Searching Database');

//     const blogs = await Blog.find({});
//     const result = listHelper.mostLikes(blogs);
    
//     const likesByAuthor = blogs.reduce((acc, blog) => {
//       acc[blog.author] = (acc[blog.author] || 0) + Number(blog.votes);
//       return acc;
//     }, {});

//     const topAuthor = Object.keys(likesByAuthor).reduce((a, b) => (likesByAuthor[a] > likesByAuthor[b] ? a : b));

//     const expected = {
//       author: topAuthor,
//       likes: likesByAuthor[topAuthor],
//     };

//     assert.deepStrictEqual(result, expected);

//     await disconnectFromDB();
//     console.log('Testing most likes');
//     console.log(`Expected: ${expected.author}\nReturned: Author: ${result.author}\nLikes: ${result.likes}`);
//   });
// })