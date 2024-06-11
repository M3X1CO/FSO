const Hello = ({ name, age }) => {
  console.log(props)

  const bornYear = () => new Date().getFullYear() - age
   

  return (
    <div>
      <p>
        Hello {name}, you are {age} years old
      </p>
      <p>
        So you were born in {bornYear()}
      </p>
    </div>
  )
}

const App = () => {
  const name = 'Peter'
  const age = 10

  return (
    <div>
      <h1>Greetings</h1>
      <Hello name='Maya' age={26+10} />
      <Hello name={name} age={age} />
    </div>
  )
}

export default App