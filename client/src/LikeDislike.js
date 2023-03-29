import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons'

const LikeDislike = () => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [score, setScore] = useState(0);

  const handleLike = () => {
    setLikes(likes + 1);
    setScore(score + 1);

  };

  const handleDislike = () => {
    setDislikes(dislikes + 1);
    setScore(score - 1);
  };

  return (
    <div className="my-5 flex-column">
      <button className="btn mx-5" onClick={handleLike}>
        <FontAwesomeIcon icon={faThumbsUp} size="3x"/>
      </button>
      <button className="btn mx-5" onClick={handleDislike}>
        <FontAwesomeIcon icon={faThumbsDown} size="3x" />
      </button>
      <p className="my-5"> DJ Level: {score} </p>
    </div>
  );
};

export default LikeDislike;