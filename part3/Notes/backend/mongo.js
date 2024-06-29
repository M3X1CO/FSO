const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://hfelix2k10:${password}@databases.dhsmnwo.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Databases`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

// const notes = [
//     { content: 'HTML is not easy', important: true },
//     { content: 'Browser can execute only JavaScript', important: false },
//     { content: 'GET and POST are the most important methods of HTTP protocol', important: true },
// ]
// Promise.all(notes.map(noteData => new Note(noteData).save()))
//     .then(result => {
//         console.log('notes saved!')
//         mongoose.connection.close()
//     }).catch(err => {
//         console.error(err)
//         mongoose.connection.close()
//     })

Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })