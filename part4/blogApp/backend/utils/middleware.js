const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../models/user');

const requestLogger = (request, response, next) => {
  console.log('Request Logger')
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const getTokenFrom = (request, response, next) => {
  const authorization = request.get('Authorization');
  logger.info('Authorization Header:', authorization); // Log the Authorization header

  if (request.path === '/api/login') {
    return next();
  }

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }
  logger.info('Extracted Token:', request.token); // Log the extracted token
  next();
};

const verifyToken = (request, response, next) => {
  const token = request.token;

  if (request.path === '/api/login') {
    return next();
  }

  if (!token) {
    return response.status(401).json({ error: 'token missing' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET);
    logger.info('Decoded Token:', decodedToken); // Log the decoded token

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' });
    }
    request.decodedToken = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
};

const userExtractor = async (request, response, next) => {
  const decodedToken = request.decodedToken;

  if (request.path === '/api/login') {
    const { username } = request.body;
    const user = await User.findOne({ username });

    if (!user) {
      return response.status(401).json({ error: 'user not found' });
    }
    request.user = user;
    return next();
  }

  if (!decodedToken || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(401).json({ error: 'user not found' });
  }

  logger.info('Extracted User:', user); // Log the extracted user
  request.user = user;
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({
      error: 'expected `username` to be unique'
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })

  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  getTokenFrom,
  verifyToken,
  userExtractor
}