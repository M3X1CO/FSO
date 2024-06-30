const express = require('express');
const Person = require('./models/person'); // Assuming you have a Person model
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('dist'));
app.use(cors());
app.use(express.json());

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

// GET all persons
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

// POST a new person
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

// GET a single person by ID
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

// DELETE a person by ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

// PUT update a person by ID
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  const person = {
    name: name,
    number: number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' });
  }

  next(error);
};

// Unknown endpoint middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
