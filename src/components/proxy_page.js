import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchDeck } from '../features/decks/decksSlice';

export default function ProxyPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const deck = useSelector(state => state.decks.selectedDeck);

  useEffect(() => {
    dispatch(fetchDeck(id));
  }, [id, dispatch]);

  const printPage = () => {
    window.print();
  };

  const renderCards = (cards = []) => {
    return cards.map((card, idx) => (
      <img
        key={`${card.Name}-${idx}`}
        src={card.Image}
        alt={card.Name}
      />
    ));
  };

  if (!deck) {
    return (
      <div>
        <h3 className="loading">loading deck...</h3>
      </div>
    );
  }

  return (
    <div className="proxy-page">

      <br />

      <button className="print-button" onClick={printPage}>
        Print
      </button>

      <Link to={`/decks/${id}`} className="back-button">
        Go Back
      </Link>

      <br />

      {/* Main deck */}
      {renderCards(deck.cards)}

      {/* Sideboard (optional future support) */}
      {deck.sideboard && renderCards(deck.sideboard)}

      {/* Maybeboard (optional future support) */}
      {deck.maybeboard && renderCards(deck.maybeboard)}

    </div>
  );
}