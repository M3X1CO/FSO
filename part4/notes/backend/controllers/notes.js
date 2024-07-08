const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
    response.json(notes)
})

notesRouter.get('/:id', async (request, response, next) => {
  try {
    const note = await Note.findById(request.params.id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    nex(error)
  }
})

notesRouter.post('/', async (request, response, next) => {
  const {content, important} = request.body

  const note = new Note({
    content: content,
    important: important || false,
  })

  try {
    const savedNote = await note.save()
    response.json(savedNote)
  } catch (error) {
    next(error)
  }
})

notesRouter.delete('/:id', async (request, response, next) => {
  try {
    await Note.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next (error)
  }
})

notesRouter.put('/:id', async (request, response, next) => {
  const {content, important} = request.body

  const note = {
    content: content,
    important: important,
  }

  try {
    const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, { new: true})
    response.json(updatedNote)
  } catch (error) {
    next(error)
  }
})

module.exports = notesRouter