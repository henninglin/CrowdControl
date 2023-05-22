import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import ProgressBar from './Progress';
import { onSnapshot, doc } from 'firebase/firestore';

const Level = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const participantCount = Math.max(localStorage.getItem("numParticipants") || 10, 10);
  const partyKeyword = localStorage.getItem("partyKeyword");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        setIsLoading(false);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentUser && partyKeyword) {
      const userRef = doc(db, "Parties", partyKeyword, "Users", currentUser.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setScore(data.score);
          setLevel(data.level);
          console.log("Score:", data.score);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentUser, partyKeyword]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please sign in to access this feature.</div>;
  }

  return (
    <div className="my-2 flex-column d-flex align-items-center">
      <h5 className="my-2">{currentUser.displayName}</h5>
      <p> DJ Level: {level}</p>
      <ProgressBar bgcolor={'#6a1b9a'} participantCount={participantCount} score={score} />
    </div>
  );
};

export default Level;
