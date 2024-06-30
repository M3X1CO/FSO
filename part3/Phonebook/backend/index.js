const express = require('express');
const Person = require('./models/person'); 
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('dist'));
app.use(cors());
app.use(express.json());
app.use(requestLogger)

app.use((request, response, next) => {
  console.log('--- Request Start ---');
  console.log(`Method: ${request.method}`);
  console.log(`Path: ${request.path}`);
  console.log(`Body: ${JSON.stringify(request.body)}`);
  console.log('--- Request End ---');
  next();
});

app.get('/', (request, response) => {
  console.log('Serving / route');
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons);
    })
    .catch(error => {
      console.error('Error fetching people:', error.message);
      next(error);
    });
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number is missing' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    }).catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
