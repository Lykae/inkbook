import React, { useEffect, useRef, useState } from 'react';

export default function CardViewer({
  open,
  cards = [],
  currentIndex,
  setCurrentIndex,
  onClose,
  onAddMaybeboard,
  getCount,
  onIncrease,
  onDecrease,
  showEditControls = false
}) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [animating, setAnimating] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [pressed, setPressed] = useState(null);
    
    const startX = useRef(0);
    const isDragging = useRef(false);
    
    const SWIPE_THRESHOLD = 90;
    
    const current = cards[currentIndex];

    const count = current && getCount ? getCount(current) : 0;

    //useEffect(() => {
    //  setImageLoaded(false);
    //}, [currentIndex]);
    
    useEffect(() => {
      if (!open) return;
    
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);
  
    if (!open || !cards.length || !current) return null;

    const handlePress = (action, card, type) => {
      setPressed(type);

      action?.(card);

      setTimeout(() => setPressed(null), 150);
    };
  
    const goNext = () => {
      setAnimating(true);
      setOffset({ x: -400, y: 0 });
    
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % cards.length);
        setOffset({ x: 0, y: 0 });
        setAnimating(false);
      }, 200);
    };
  
    const goPrev = () => {
      setAnimating(true);
      setOffset({ x: 400, y: 0 });
    
      setTimeout(() => {
        setCurrentIndex((i) => (i - 1 + cards.length) % cards.length);
        setOffset({ x: 0, y: 0 });
        setAnimating(false);
      }, 200);
    };
  
    const onPointerDown = (e) => {
      isDragging.current = true;
      startX.current = e.clientX;
        
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
    
      const x = e.clientX - startX.current;
      setOffset({ x, y: 0 });
    };
    
    const onPointerUp = (e) => {
      isDragging.current = false;
    
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
  
      if (offset.x > SWIPE_THRESHOLD) goPrev();
      else if (offset.x < (SWIPE_THRESHOLD * -1)) goNext();
      else setOffset({ x: 0, y: 0 });
    };
  
    const style = {
      transform: `translate(${offset.x}px, 0) rotate(${offset.x * 0.05}deg)`,
      transition: animating ? 'transform 0.2s ease-out' : 'none'
    };
  
    const name = current.name || current.Name;
    const image = current.image || current.Image;
  
    return (
      <div
        className="card-viewer-overlay"
        onClick={onClose}
      >
        <div
          className="card-viewer-content"
          onClick={(e) => e.stopPropagation()}
        >
    
          <div className="card-viewer-close" onClick={onClose}>
            ✕
          </div>
    
          <div
            className="card-swipe-area"
            key={currentIndex}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={style}
          >
            <div className="card-image-wrapper">
              <img
                key={image}
                src={image}
                alt={name}
              />
            </div>
          </div>

        <div className="card-viewer-actions">
            {showEditControls && (<button
              className={pressed === 'dec' ? 'pressed' : ''}
              onClick={() => handlePress(onDecrease, current, 'dec')}
            >
              −
            </button>
            )}

            <span className="card-count">{count}</span>

            {showEditControls && (<button
              className={pressed === 'inc' ? 'pressed' : ''}
              onClick={() => handlePress(onIncrease, current, 'inc')}
            >
              +
            </button>
            )}

            {showEditControls && (<button
              className={pressed === 'maybe' ? 'pressed' : ''}
              onClick={() => handlePress(onAddMaybeboard, current, 'maybe')}
            >
              +?
            </button>
            )}
        </div>
    
        </div>
      </div>
    );
}