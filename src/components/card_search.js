import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { fetchCards, selectCard } from '../features/cards/cardsSlice';

export default function CardSearch({ 
    openViewer,
    getCount,
    onIncrease,
    onDecrease 
  }) {
  const dispatch = useDispatch();
  const foundCards = useSelector(state => state.cards.foundCards);

  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const search = useCallback(
    _.debounce((term) => {
      if (term && term.trim() !== '') {
        dispatch(fetchCards({ name: term }));
        setSearchSubmitted(true);
      }
    }, 300),
    []
  );

  return (
    <div className="card_search col-sm-4">
      <h4>Search Cards</h4>

      <input
        placeholder="Elsa"
        onChange={(e) => search(e.target.value)}
      />

      <ul>
        {foundCards?.length < 1 && searchSubmitted ? (
          <span className="error">No cards found.</span>
        ) : (
          foundCards?.map((card, i) => (
            <li
              key={`${card.Name}-${card.Set_Name}-${i}`}
              className="deck_row search_row"
            >
              <div
                className="card_name"
                onClick={() => {
                  dispatch(selectCard(card));
                  if (openViewer) openViewer(foundCards, card);
                }}
              >
                <strong className="card_title">
              
                  <span
                    className={`card_count ${card.Inkable ? 'inkable' : 'not_inkable'}`}
                  >
                    {card.Cost}
                  </span>
              
                  {card.Name}
              
                </strong>
              </div>
              
              <div className="card_controls">
                <button
                  className="ctrl_btn minus"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 prevents triggering select
                    onDecrease(card);
                  }}
                >
                  −
                </button>
                
                <span className="count_display">
                  {getCount ? getCount(card) : 0}
                </span>
                
                <button
                  className="ctrl_btn plus"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 important
                    onIncrease(card);
                  }}
                >
                  +
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}