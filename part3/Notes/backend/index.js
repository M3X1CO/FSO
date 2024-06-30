const express = require('express')
const Note = require('./models/note')
const cors = require('cors');
const app = express()
const PORT = process.env.PORT || 3001

app.use(express.static('dist'));
app.use(cors());
app.use(express.json())

app.use((request, response, next) => {
  console.log('--- Request Start ---')
  console.log(`Method: ${request.method}`)
  console.log(`Path: ${request.path}`)
  console.log(`Body: ${JSON.stringify(request.body)}`)
  console.log('--- Request End ---')
  next()
})

app.get('/', (request, response) => {
  console.log('Serving / route')
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response, next) => {
  Note.find({})
    .then(notes => {
      response.json(notes)
  }).catch(error => {
    console.error('Error fetching notes:', error.message)
    next(error)
  })
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
  }).catch(error => {
    console.log(error)
    response.status(500).end()
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown Endpoint '})
}

app.use(unknownEndpoint)

app.use((error, request, response, next) => {
  console.error('Error:', error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID '})
  }
  next(error)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})