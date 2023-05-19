import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import ProgressBar from './Progress';
import { collection, onSnapshot, updateDoc } from 'firebase/firestore';

const Level = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const participantCount = Math.max(localStorage.getItem("numParticipants") || 10, 10);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("User in onAuth", user);
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
  const partyKeyword = localStorage.getItem("partyKeyword");

  if (currentUser && partyKeyword) {
    console.log("level");
    const usersRef = collection(db, "Parties", partyKeyword, "Users");
    
    const unsubscribe = onSnapshot(usersRef, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.id === currentUser.uid) {
          const data = doc.data();
          setScore(data.score);
          setLevel(data.level);
          console.log("Score:", data.score); 
          if (data.score >= participantCount) {
            setLevel(data.level + 1);
            setScore(0);
            console.log("doc.ref:", doc.ref);
            if(doc.ref){
                updateDoc(doc.ref, { score: 0, level: data.level + 1}).then(()=>{
                    console.log("Level Increased");
                }).catch((error) =>{
                    console.log("Error updating score:", error);
                })
            }
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }
}, [currentUser]);


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
