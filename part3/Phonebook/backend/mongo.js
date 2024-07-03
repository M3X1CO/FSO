const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://hfelix2k10:${password}@databases.dhsmnwo.mongodb.net/dataBase?retryWrites=true&w=majority&appName=Databases`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Note = mongoose.model('Note', noteSchema)

if (process.argv.length === 3) {
  Note.find({}).then(result => {
    result.forEach(note => {
      console.log(`${note.name} ${note.number}`)
    })
    mongoose.connection.close()
  }).catch(err => {
    console.error('Error fetching notes:', err)
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const note = new Note({
    name: name,
    number: number,
  })

  note.save().then(() => {
    console.log(`Added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  }).catch(err => {
    console.error('Error saving note:', err)
    mongoose.connection.close()
  })
} else {
  console.log('Invalid number of arguments. Please provide the name and number to add a new note.')
  mongoose.connection.close()
}
