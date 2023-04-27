import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from './Progress';
import { auth, db } from './firebase';

const LikeDislike = () => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
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
    if (score >= 100 && currentUser) {
      setLevel(level + 1);
      setScore(score - 100);
      if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ level: level + 1 });
      }
    }
  }, [score, level, currentUser]);

  const handleLike = () => {
    setLikes(likes + 1);
    setScore(score + 1);
  };

  const handleDislike = () => {
    setDislikes(dislikes + 1);
    setScore(Math.max(score - 1, 0));
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
          <FontAwesomeIcon icon={faThumbsUp} size="2x"/>
        </button>
        <button className="btn mx-3 btn-outline-danger" onClick={handleDislike}>
          <FontAwesomeIcon icon={faThumbsDown} size="2x" />
        </button>
      </div>
      <h5 className="my-2">{currentUser.displayName}</h5>
      <p> DJ Level: {level}</p>
      <ProgressBar bgcolor={'#6a1b9a'} completed={score} />
    </div>
  );
};

export default LikeDislike;
