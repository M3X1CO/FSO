import React from 'react';

const Header = (props) => {
  console.log('Header props:', props);
  return (
    <div>
      <h1>
        {props.course}
      </h1>
    </div>
  );
};

const Content = (props) => {
  console.log('Content props:', props);
  return (
    <div>
      {props.part.map((item, index) => (
        <span key={index}>
          {item.name} {item.excecises}
          <br/><br/>
        </span>
      ))}
    </div>
  );
};

const Total = (props) => {
  console.log('Total props:', props);
  const totalExercises = props.part.reduce((acc, part) => acc + part.exercises, 0);
  return (
    <div>
      Number of exercises {totalExercises}
    </div>
  );
};

const App = () => {
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React', 
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  };

  console.log('App props:', { course });

  return (
    <div>
      <Header course={course.name} />
      <Content part={course.parts} />
      <Total part={course.parts} />
    </div>
  );
};

export default App;
