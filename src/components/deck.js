import React from 'react';
import AnimateOnChange from 'react-animate-on-change';

export default function Deck({ deck }) {

  const renderColor = () => {
    if (!deck?.cards) return null;

    const uniqueColors = [
      ...new Set(
        deck.cards.flatMap(card =>
          (card.Color || '')
            .split(',')
            .map(c => c.trim())
        )
      )
    ];

    return uniqueColors.map((color) => (
      <img
        key={color}
        className="deck_color_icon"
        src={`/inkbook/img/${color.toLowerCase()}.png`}
        alt={color}
      />
    ));
  };

  const creator = deck?.creator || 'Anonymous';

  return (
    <AnimateOnChange
      baseClassName="deck"
      animationClassName="deck-animate"
      animate={true}
    >
      <div className="deck_item">

        <div className="deck_item_head">
          <div>
            <h3>{deck?.name}</h3>

            <span className="deck_item_format">
              {deck?.format} deck by {creator}
            </span>
          </div>

          <div className="deck_item_colors">
            {renderColor()}
          </div>
        </div>

        {/*renderDeckBottom()*/}

      </div>
    </AnimateOnChange>
  );
}