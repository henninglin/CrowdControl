import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import ProgressBar from './Progress';
import { collection, onSnapshot, updateDoc } from 'firebase/firestore';

const Level = () => {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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
    const partyKeyword = localStorage.getItem("partyKeyword");

    if (currentUser && partyKeyword) {
      const usersRef = collection(db, "Parties", partyKeyword, "Users");
      
      const unsubscribe = onSnapshot(usersRef, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.id === currentUser.uid) {
            const data = doc.data();
            setScore(data.score);
            setLevel(data.level);
            console.log("Score:", data.score);
  
            if (data.score > 10) {
              setLevel(data.level + 1);
              setScore(0);
  
              if (doc.ref) {
                updateDoc(doc.ref, { score: 0, level: data.level + 1 }).then(() => {
                  console.log("Level Increased");
                }).catch((error) => {
                  console.log("Error updating score:", error);
                });
              }
            } else if (data.score < 0 && data.level > 1) {
              setLevel(data.level - 1);
              setScore(9);
  
              if (doc.ref) {
                updateDoc(doc.ref, { level: data.level - 1, score: 9 }).then(() => {
                  console.log("Level Decreased");
                }).catch((error) => {
                  console.log("Error updating level:", error);
                });
              }
            } else if (data.score < 0 && data.level === 1) {
              setScore(0);
  
              if (doc.ref) {
                updateDoc(doc.ref, { score: 0 }).then(() => {
                  console.log("Score set to 0");
                }).catch((error) => {
                  console.log("Error updating score:", error);
                });
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
      <ProgressBar bgcolor={'#6a1b9a'} completed={score} />
    </div>
  );
};

export default Level;
