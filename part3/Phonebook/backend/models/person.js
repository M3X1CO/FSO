const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URL

if (!url) {
  console.error('Error: MONGODB_URL env variable is not set.')
  process.exit(1)
}

console.log('Connecting to MongoDB')

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message)
  })

const phoneValidator = (v) => {
  const parts = v.split('-')
  if (parts.length !== 2) {
    return false
  }
  const [firstPart, secondPart] = parts
  if (firstPart.length < 2 || firstPart.length > 3 || !/^\d+$/.test(firstPart)) {
    return false
  }
  if (secondPart.length < 5 || !/^\d+$/.test(secondPart)) {
    return false
  }
  return true
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: phoneValidator,
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required'],
    minLength: 8
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema, 'phonebook')

module.exports = Person
