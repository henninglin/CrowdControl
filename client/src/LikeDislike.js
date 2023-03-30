import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons'
import ProgressBar from "./Progress";

const LikeDislike = () => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (score >= 100) {
      setLevel(level + 1);
      setScore(score - 100);
    }
  }, [score, level]);

  const handleLike = () => {
    setLikes(likes + 1);
    setScore(score + 1);
  };

  const handleDislike = () => {
    setDislikes(dislikes + 1);
    setScore(Math.max(score - 1, 0));
  };

  return (
    <div className="my-2 flex-column d-flex align-items-center">
      <div className="d-flex justify-content-center">
        <button className="btn mx-5" onClick={handleLike}>
          <FontAwesomeIcon icon={faThumbsUp} size="2x"/>
        </button>
        <button className="btn mx-5" onClick={handleDislike}>
          <FontAwesomeIcon icon={faThumbsDown} size="2x" />
        </button>
      </div>
      <p className="my-2">DJ Level: {level}</p>
      <ProgressBar bgcolor={"#6a1b9a"} completed={score} />
    </div>
  );
};

export default LikeDislike;
