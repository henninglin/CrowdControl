import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { auth, db } from './firebase';
import { getDoc, doc, updateDoc, increment } from "firebase/firestore";

const LikeDislike = ({ songId, hideSong }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const partyKeyword = localStorage.getItem("partyKeyword");

  //Increase Global Like Counter by 1, after like.  
  const updateGlobalLike = async (incrementBy) => {
    try {
      const partyRef = doc(db, 'Parties', partyKeyword);
      await updateDoc(partyRef, {
        Like: increment(incrementBy)
      });
      console.log(`Global Like updated by ${incrementBy}`);
    } catch (error) {
      console.error('Error updating Global Like:', error);
    }
  };

  //Increase Global Dislike Counter by 1, after dislike.
  const updateGlobalDislike = async (incrementBy) => {
    try {
      const partyRef = doc(db, 'Parties', partyKeyword);
      await updateDoc(partyRef, {
        Dislike: increment(incrementBy)
      });
      console.log(`Global Like updated by ${incrementBy}`);
    } catch (error) {
      console.error('Error updating Global Like:', error);
    }
  };



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


  //Update the score of the user that has requested the song.
  const updateUserScore = async (scoreChange) => {
    if (!songId || !currentUser) {
      return;
    }
  
    try {
      const songRef = doc(db, "Parties", partyKeyword, "searchedSongs", songId);
      const songDoc = await getDoc(songRef);
  
      if (songDoc.exists()) {
        const songData = songDoc.data();
        const songOwnerUid = songData.user;
        const userRef = doc(db, "Parties", partyKeyword, "Users", songOwnerUid);
        await updateDoc(userRef, { score: increment(scoreChange) });
        console.log("User's score updated.", scoreChange);
        
      } else {
        console.log("Song document does not exist.");
      } 
    } catch (error) {
      console.error("Error updating user's score:", error);
    }
  };

  const handleLike = async () => {
    console.log("handleLike called");
    if (!songId) return;
    
    await updateLikesDislikes(true);
    updateUserScore(1);
    updateGlobalLike(1);
    await updateUserActivity(true);
    hideSong();
  };

  //Update Like or Dislike Activity Counter On The User.
  const updateUserActivity = async (isLike) => {
    console.log("updateLikeDislikePressed called with:", { isLike, songId });
    if (!songId) return console.log("No songs to like or dislike");

    const userRef = doc(db, "Parties", partyKeyword, "Users", currentUser.uid);

    if (isLike) {
      await updateDoc(userRef, {
        LikePressed: increment(1),
      });
    } else {
      await updateDoc(userRef, {
        DisLikePressed: increment(1),
      });
    }
  };
  
  const handleDislike = async () => {
    console.log("handleDislike called");
    if (!songId) return;
  
    await updateLikesDislikes(false);
    updateUserScore(-1);
    updateGlobalDislike(1);
    await updateUserActivity(false);
    hideSong();
  };

  const updateLikesDislikes = async (isLike) => {
    console.log("updateLikesDislikes called with:", { isLike, songId });
    if (!songId) return;
  
    const songRef = doc(db, "Parties", partyKeyword, "searchedSongs", songId);
    const songDoc = await getDoc(songRef);
  
    if (songDoc.exists()) {
      const songData = songDoc.data();
      if (isLike) {
        await updateDoc(songRef, {
          score: increment(1),
        });
      } else {
        if (songData.dislike) {
          await updateDoc(songRef, {
            dislike: increment(1),
          });
        } else {
          await updateDoc(songRef, {
            dislike: 1,
          });
        }
      }
    } else {
      console.log("Song document does not exist.");
    }
  };
  
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please sign in to access this feature.</div>;
  }

  return (
    <div className="my-2 flex-column d-flex align-items-center">
      <div className="d-flex justify-content-center">
        <button className="btn mx-3 btn-outline-success" onClick={handleLike}>
          <FontAwesomeIcon icon={faThumbsUp} size="lg"/>
        </button>
        <button className="btn mx-3 btn-outline-danger" onClick={handleDislike}>
          <FontAwesomeIcon icon={faThumbsDown} size="lg" />
        </button>
      </div>
    </div>
  );
};

export default LikeDislike;
