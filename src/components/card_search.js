import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { fetchCards, selectCard } from '../features/cards/cardsSlice';

export default function CardSearch({ openViewer }) {
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
              onClick={() => {
                dispatch(selectCard(card));

                if (openViewer) {
                  openViewer(foundCards, card);
                }
              }}
            >
              <strong>{card.Name}</strong>
              <span className="pull-right">{card.Type}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}