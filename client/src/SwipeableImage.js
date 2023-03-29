import React, { useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './SwipeableImage.css';

function SwipeableImage(props) {
  const [swipeDirection, setSwipeDirection] = useState(null);
  const startXRef = useRef(null);
  const imageRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);

  function handleTouchStart(e) {
    startXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    const endX = e.changedTouches[0].clientX;
    const distance = endX - startXRef.current;

    if (distance > 0) {
      setSwipeDirection('right');
      setOffsetX(offsetX + 100);
    } else if (distance < 0) {
      setSwipeDirection('left');
      setOffsetX(offsetX - 100);
    }
  }

  function handleTransitionEnd(e) {
    if (swipeDirection === 'right') {
      setOffsetX(0);
    } else if (swipeDirection === 'left') {
      setOffsetX(-200);
    }
    setSwipeDirection(null);
  }

  return (
    <div
      className="swipeable-image-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={imageRef}
        className={`swipeable-image ${swipeDirection ? 'swipeable-image-transition' : ''}`}
        style={{ transform: `translateX(${offsetX}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        <img src={props.src} alt={props.alt} />
      </div>
      <div className="swipeable-image-controls">
        <button onClick={() => setOffsetX(offsetX + 100)}><FiChevronLeft /></button>
        <button onClick={() => setOffsetX(offsetX - 100)}><FiChevronRight /></button>
      </div>
    </div>
  );
}

export default SwipeableImage;