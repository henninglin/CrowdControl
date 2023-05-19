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
  const [songChanged, setSongChanged] = useState(false);

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
    setSongChanged(true);
  }, [songId]);

  useEffect(() => {
    if (songChanged) {
      // Reset the like and dislike state when the songId changes
      setLiked(false);
      setDisliked(false);
  
      // Update user's score with the just played song's score
      const updateUserScoreWithSongScore = () => {
        if (!songId || !currentUser) return;
  
        (async () => {
          try {
            // Get the just played song's score from the searchedSongs collection
            const songRef = doc(db, "Parties", partyKeyword, "searchedSongs", songId);
            const songDoc = await getDoc(songRef);
  
            if (songDoc.exists()) {
              const songScore = songDoc.data().score;
  
              // Get the user's score from the Users collection
              const userRef = doc(db, "Parties", partyKeyword, "Users", currentUser.uid);
              const userDoc = await getDoc(userRef);
  
              if (userDoc.exists()) {
                const userScore = userDoc.data().score;
  
                // Update the user's score in the Users collection
                await updateDoc(userRef, { score: userScore + songScore });
                console.log("User's score updated with the just played song's score.");
              }
            }
          } catch (error) {
            console.error("Error updating user's score:", error);
          }
        })();
      };
  
      updateUserScoreWithSongScore();
      setSongChanged(false);
    }
  }, [songChanged, songId, currentUser, partyKeyword]);

  const handleLike = async () => {
    console.log("handleLike called");
    if (!songId || liked || disliked) return;
    
    await updateLikesDislikes(true);
    setLiked(true);
    setDisliked(false);
    hideSong();
  };
  
  const handleDislike = async () => {
    console.log("handleDislike called");
    if (!songId || disliked || liked) return;
  
    await updateLikesDislikes(false);
    setLiked(false);
    setDisliked(true);
    hideSong();
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
