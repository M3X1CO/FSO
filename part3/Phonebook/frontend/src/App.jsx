import React, { useState } from 'react';
import { Names, Filter, PersonForm, Persons } from './components/Note';
import Notification from './components/Notification';
import notes from './services/notes'; 

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filterItems, setFilterItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialNotes = await notes.getAll();
        setPersons(initialNotes);
        setFilterItems(initialNotes);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  const addName = (event) => {
    event.preventDefault();

    const nameExists = persons.find((person) => person.name.toLowerCase() === newName.toLowerCase());

    const nameObject = {
      name: newName,
      number: newNumber,
    };

    if (nameExists) {
      const confirmed = window.confirm(`Do you wish to update ${nameExists.name}?`);
      if (!confirmed) {
        return;
      }
      notes.update(nameExists.id, nameObject)
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id !== nameExists.id ? person : returnedPerson));
          setFilterItems(filterItems.map(person => person.id !== nameExists.id ? person : returnedPerson));
          setSuccessMessage(`Updated ${newName}`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 4000);
        })
        .catch(error => {
          setErrorMessage(`Information of ${newName} has already been deleted from the server`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 4000);
        });
    } else {
      notes.create(nameObject)
        .then(returnedPerson => {
          setPersons([...persons, returnedPerson]);
          setFilterItems([...filterItems, returnedPerson]);
          setSuccessMessage(`Added ${newName}`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 4000);
        })
        .catch(error => {
          setErrorMessage(`Error adding ${newName}`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 4000);
        });
    }

    setNewName('');
    setNewNumber('');
    setSearchName('');
  };

  const deleteName = (id) => {
    const person = persons.find(person => person.id === id);
    const confirmDelete = window.confirm(`Delete ${person.name} ?`);
    if (confirmDelete) {
      notes.remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          setFilterItems(filterItems.filter(person => person.id !== id));
          setSuccessMessage(`Deleted ${person.name}`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 4000);
        })
        .catch(error => {
          setErrorMessage(`Error deleting ${person.name}`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 4000);
          setPersons(persons.filter(person => person.id !== id));
          setFilterItems(filterItems.filter(person => person.id !== id));
        });
    }
  };


  const handleSearchName = (event) => {
    setSearchName(event.target.value);
    const filteredItems = persons.filter(person =>
      person.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilterItems(filteredItems);
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification successMessage={successMessage} errorMessage={errorMessage} />
      <Filter searchName={searchName} handleSearchName={handleSearchName} />
      <h3>Add a new</h3>
      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={(e) => setNewName(e.target.value)}
        newNumber={newNumber}
        handleNumberChange={(e) => setNewNumber(e.target.value)}
      />
      <h3>Numbers</h3>
      <Persons persons={filterItems} deleteName={deleteName} />
    </div>
  );
};

export default App;
