import React from 'react';

const ParticipantsList = () => {
  // An array of hard-coded participants
  const participants = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie', email: 'charlie@example.com' },
    { name: 'Dave', email: 'dave@example.com' },
    { name: 'Eve', email: 'eve@example.com' },  
  ];

  return (
    <div>
      <h2>Participants:</h2>
      <ul style={{listStyleType: 'none', padding:0}}>
        {participants.map((participant) => (
          <li key={participant.email}>
            {participant.name} ({participant.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantsList;
