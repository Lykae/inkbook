import React from 'react';
import AnimateOnChange from 'react-animate-on-change';

export default function Deck({ deck }) {

  const renderColor = () => {
    const colorMap = {
      Amber: '#f2c14e',
      Amethyst: '#b46cff',
      Emerald: '#3cb371',
      Ruby: '#e63946',
      Sapphire: '#4ea8de',
      Steel: '#6c757d'
    };

    if (!deck?.cards) return null;

    const uniqueColors = [...new Set(deck.cards.map(c => c.Color))];

    return uniqueColors.map((color) => (
      <div
        key={color}
        className="color"
        style={{ backgroundColor: colorMap[color] }}
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