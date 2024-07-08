const _ = require('lodash')

const dummy = (blogs) => {
    return 1
  }

const totalVotes = (blogs) => {
const total = blogs.reduce((sum, blog) => {
    return sum + Number(blog.votes);
    }, 0);
    return total;
};

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return null;
    }
  
    const favorite = blogs.reduce((prev, current) => (Number(prev.votes) > Number(current.votes) ? prev : current));
    return {
      title: favorite.title,
      author: favorite.author,
      votes: favorite.votes
    };
};
  
const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
      return null;
    }
  
    const authorBlogCounts = _.countBy(blogs, 'author');
    const topAuthor = _.maxBy(Object.keys(authorBlogCounts), (author) => authorBlogCounts[author]);
  
    return {
      author: topAuthor,
      blogs: authorBlogCounts[topAuthor],
    };
};
  
const mostLikes = (blogs) => {
    if (blogs.length === 0) {
      return null;
    }
  
    const likesByAuthor = blogs.reduce((acc, blog) => {
      acc[blog.author] = (acc[blog.author] || 0) + Number(blog.votes);
      return acc;
    }, {});
  
    const topAuthor = _.maxBy(Object.keys(likesByAuthor), (author) => likesByAuthor[author]);
  
    return {
      author: topAuthor,
      likes: likesByAuthor[topAuthor],
    };
};
  
module.exports = {
dummy,
totalVotes,
favoriteBlog,
mostBlogs,
mostLikes
};