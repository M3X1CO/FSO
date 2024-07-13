const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../models/user');

const requestLogger = (request, response, next) => {
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

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  getTokenFrom,
  verifyToken,
  userExtractor
};
