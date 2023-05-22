import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { auth, db } from './firebase';
import { getDoc, doc, updateDoc, increment } from "firebase/firestore";

const LikeDislike = ({ songId, hideSong }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  const partyKeyword = localStorage.getItem("partyKeyword");

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

  const updateGlobalDislike = async (incrementBy) => {
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
    if (!songId || liked || disliked) return;
    
    await updateLikesDislikes(true);
    setLiked(true);
    setDisliked(false);
    updateUserScore(1);
    updateGlobalLike(1);
    await updateUserActivity(true);
    //hideSong();
  };

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
    if (!songId || disliked || liked) return;
  
    await updateLikesDislikes(false);
    setLiked(false);
    setDisliked(true);
    updateUserScore(-1);
    updateGlobalDislike(1);
    //hideSong();
  };

  const updateLikesDislikes = async (isLike) => {
    console.log("updateLikesDislikes called with:", { isLike, songId });
    if (!songId) return;
  
    const songRef = doc(db, "Parties", partyKeyword, "searchedSongs", songId);
  
    if (isLike) {
      await updateDoc(songRef, {
        score: increment(1),
      });
    } else {
      await updateDoc(songRef, {
        score: increment(-1),
      });
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
        <button className={`btn mx-3 btn-outline-success${liked || disliked ? ' disabled' : ''}`} onClick={handleLike}>
          <FontAwesomeIcon icon={faThumbsUp} size="lg"/>
        </button>
        <button className={`btn mx-3 btn-outline-danger${liked || disliked ? ' disabled' : ''}`} onClick={handleDislike}>
          <FontAwesomeIcon icon={faThumbsDown} size="lg" />
        </button>
      </div>
    </div>
  );
};

export default LikeDislike;
