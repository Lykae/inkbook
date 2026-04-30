import React, { useMemo, useState } from 'react';
import AnimateOnChange from 'react-animate-on-change';

export default function SampleHand({ deck }) {
  const [cardsInHand, setCardsInHand] = useState(7);

  const handleMulliganClick = () => {
    setCardsInHand(prev => (prev === 1 ? 7 : prev - 1));
  };

  // Fisher-Yates shuffle (safe version)
  const shuffle = (array) => {
    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
  };

  const hand = useMemo(() => {
    const cards = deck?.cards || [];
    const shuffled = shuffle(cards);
    return shuffled.slice(0, cardsInHand);
  }, [deck, cardsInHand]);

  return (
    <div className="hand_container">
      <h2>Sample Hand</h2>

      <button
        className="hand_button"
        onClick={handleMulliganClick}
      >
        Mulligan
      </button>

      <div className="sample_hand">
        {hand.map((card, idx) => (
          <AnimateOnChange
            key={`${card.Name}-${idx}`}
            baseClassName="hand-card"
            animationClassName="hand-card-animate"
            animate={true}
          >
            <img
              alt={card.Name}
              src={card.Image}
            />
          </AnimateOnChange>
        ))}
      </div>
    </div>
  );
}