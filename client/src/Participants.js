import React from 'react';
import { db } from "./firebase";
import { collection, onSnapshot } from 'firebase/firestore';

const ParticipantsList = () => {

  const userRef = collection(db, "Parties")
  const partyRef = collection(db, "Parties")

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
      <h5 className="mb-3">Party Keyword: 1231201</h5>
      <p className="mb-0">Participants:</p>
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
