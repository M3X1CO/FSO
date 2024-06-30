import { useState, useEffect } from 'react'
import { Names, Filter, PersonForm, Persons } from './components/Note';
import axios from 'axios'
import notes from './services/notes'
import Notification from './components/Notification';


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchName, setSearchName] = useState('')
  const [filterItems, setFilterItems] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const initialNotes = await notes.getAll()
          setPersons(initialNotes)
          setFilterItems(initialNotes)
    } catch (error) {
      console.error('Error fetching data', error)
    }
  }

  fetchData()
}, [])

  const addName=(event) => {
    event.preventDefault()
    console.log('button clicked', event.target)

    const nameExists = persons.find((person) => person.name.toLowerCase() === newName.toLowerCase())
    
    const nameObject= {
      name: newName,
      number: newNumber
    }

    if (nameExists) {
      const confirmed = window.confirm(`Do you wish to update ${nameExists.name}?`)
      if (!confirmed) {
        return
      }
      notes.update(nameExists.id, nameObject).then(returnedPerson => {
        setPersons(persons.map(person => person.id !== nameExists.id ? person : returnedPerson))
        setFilterItems(filterItems.map(person => person.id !== nameExists.id ? person : returnedPerson))
      }).catch(error => {
        setErrorMessage(`Information of ${newName}' has already been deleted from the server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 4000)
      })

    } else {
      notes.create(nameObject)
      .then(returnedPerson => {
        console.log(returnedPerson)
        setPersons(persons.concat(returnedPerson));
        setFilterItems(filterItems.concat(returnedPerson));
        setSuccessMessage(`Added ${newName}`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 4000)
      })
    }
    setNewName('');
    setNewNumber('');
    setSearchName('');
  }

const deleteName=(id) => {
  const person = persons.find(person => person.id === id)
  const confirmDelete = window.confirm(`Delete ${person.name} ?`)
  if (confirmDelete) {
    notes.remove(id)
    .then(() => {
      setPersons(persons.filter(person => person.id !== id))
      setFilterItems(filterItems.filter(person => person.id !== id))
    })
    .catch(error => {
      setErrorMessage(`${person.name}' has already been deleted from the server`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 4000)
      setPersons(persons.filter(person => person.id !== id))
      setFilterItems(filterItems.filter(person => person.id !== id))
    }, [])
  }
}

const handleNameChange=(event) => {
 setNewName(event.target.value) 
}

const handleNumberChange=(event) => {
  setNewNumber(event.target.value) 
}

const handleSearchName=(event) => {
  setSearchName(event.target.value)

  const filterItems = persons.filter(person => {
    if (person.name.toLowerCase().includes(event.target.value.toLowerCase())) {
      return person
    }})
    setFilterItems(filterItems)
}

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} errorMessage={errorMessage} />
      <Filter 
      searchName={searchName} 
      handleSearchName={handleSearchName} />
        <h3>Add a new</h3>
        <PersonForm addName={addName} newName={newName} handleNameChange={handleNameChange} newNumber={newNumber} handleNumberChange={handleNumberChange} />
        <h3>Numbers</h3>
        <Persons persons={filterItems} deleteName={deleteName} />
    </div>
  )
}

export default App