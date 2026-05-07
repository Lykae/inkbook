import React, { useMemo, useState, useEffect } from 'react';
import AnimateOnChange from 'react-animate-on-change';

export default function SampleHand({ deck, handleCardClick }) {

  const [hand, setHand] = useState([]);

  const shuffle = (array) => {
    const arr = [...array];
    
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  
    return arr;
  };

  const drawHand = () => {
    const cards = deck?.cards || [];

    const shuffled = shuffle(cards);
    const newHand = shuffled.slice(0, 7).map(card => ({
      ...card,
      name: card.name || card.Name,
      image: card.image || card.Image,
      set_name: card.set_name || card.Set_Name,
      cost: card.cost ?? card.Cost
    }));

    setHand(newHand);
  };

    useEffect(() => {
    if (deck?.cards?.length) {
      drawHand();
    }
  }, [deck]);

  return (
    <div className="hand_container">
      <h2>Sample Hand</h2>

      <div className="sample_hand">
        {hand.map((card, idx) => (
          <AnimateOnChange
            key={`${card.name}-${idx}`}
            baseClassName="hand-card"
            animationClassName="hand-card-animate"
            animate={true}
          >
            <img
              onClick={() => handleCardClick(card, hand)}
              alt={card.name}
              src={card.image}
            />
          </AnimateOnChange>
        ))}
      </div>

      <button
        className="hand_button"
        onClick={drawHand}
      >
        Mulligan
      </button>
    </div>
  );
}