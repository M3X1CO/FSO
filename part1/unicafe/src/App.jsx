import React, { useState } from 'react'

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>
    {text}
  </button>
)

const StatisticLine = ({ text, value }) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{value}</td>
    </tr>
  )
}

const Statistics = ({ good, neutral, bad, all }) => {
  if (all === 0) {
    return <h3>No feedback given</h3>
  }

  return (
    <table>
      <tbody>
      <StatisticLine text='Good' value={good} all={all}/>
      <StatisticLine text="Neutral" value ={neutral} all={all}/>
      <StatisticLine text="Bad" value ={bad} all={all}/>
      <StatisticLine text="All" value ={all} all={all}/>
      <StatisticLine text="Average" value ={(good - bad) / (good + neutral + bad)} all={all}/>
      <StatisticLine text="Positive" value ={good / (good + neutral + bad) * 100 + '%'} all={all}/>
      </tbody>
    </table>
  )
}

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  const [all, setAll] = useState(0)

  const handleGoodClick = () => {
    const updatedGood = good + 1
    setGood(updatedGood)
    setAll(updatedGood + neutral + bad)
  }

  const handleNeutralClick = () => {
    const updatedNeutral = neutral + 1
    setNeutral(updatedNeutral)
    setAll(good + updatedNeutral + bad)
  }

  const handleBadClick = () => {
    const updatedBad = bad + 1
    setBad(updatedBad)
    setAll(good + neutral + updatedBad)
  }

  return (
    <div>
      <h1>Give Feedback</h1>

      <Button handleClick={handleGoodClick} text='good' />
      <Button handleClick={handleNeutralClick} text='neutral' />
      <Button handleClick={handleBadClick} text='bad' />

      <h1>Statistics</h1>

      <Statistics good={good} neutral={neutral} bad={bad} all={all} />

    </div>
  )
}

export default App