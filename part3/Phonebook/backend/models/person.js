const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URL;

if (!url) {
  console.error('Error: MONGODB_URL env variable is not set.');
  process.exit(1);
}

console.log('Connecting to MongoDB');

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Person = mongoose.model('Person', personSchema, 'phonebook');

module.exports = Person;
