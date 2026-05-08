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
        src={`/img/${color.toLowerCase()}.png`}
        alt={color}
      />
    ));
  };

  const renderDeckBottom = () => {
    const cards = deck?.cards || [];

    if (cards.length === 0) {
      return (
        <div className="deck_item_bottom empty">
          No cards in deck
        </div>
      );
    }

    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    return (
      <div className="deck_item_bottom">
        {randomCard?.Image && (
          <div
            className="deck_image"
            style={{
              backgroundImage: `url(${randomCard.Image})`
            }}
          />
        )}

        <p>
          {(deck.description || '').slice(0, 180)}...
          <br />
          <strong>(Read more)</strong>
        </p>
      </div>
    );
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