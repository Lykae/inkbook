import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { fetchDecks } from '../features/decks/decksSlice';
import Deck from './deck';

import { getFormats } from '../constants/formats';

export default function DeckList() {
  const dispatch = useDispatch();
  const decks = useSelector(state => state.decks.list);

  const [selectedFormat, setSelectedFormat] = useState('All');
  const [inputtedName, setInputtedName] = useState('');

  useEffect(() => {
    dispatch(fetchDecks());
  }, [dispatch]);

  const handleSearch = useMemo(
    () => _.debounce((term) => setInputtedName(term), 300),
    []
  );

  console.log("decks state:", decks);

  const filteredDecks = useMemo(() => {
    if (!Array.isArray(decks)) return [];
    
    return decks.filter((deck) => {
      const matchesName =
        !inputtedName ||
        deck.name?.toLowerCase().includes(inputtedName.toLowerCase());
    
      const matchesFormat =
        selectedFormat === 'All' ||
        deck.format === selectedFormat;
    
      return matchesName && matchesFormat;
    });
  }, [decks, inputtedName, selectedFormat]);

  if (!decks) {
    return <h3 className="loading">loading decks...</h3>;
  }

  return (
    <div className="container">

      <h2>{selectedFormat} Decks</h2>

      {/* Filters */}
      <div className="deck_inputs row">

        <div className="deck_inputs_group">

          <div className="filter">
            <label>Deck Name</label>
            <input
              placeholder="Search decks..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <br />

          <div className="filter">
            <label>Filter</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="All">All</option>
              {getFormats().map(format => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          <br />

          <i
            className="fa fa-times clear-filters"
            onClick={() => {
              setSelectedFormat('All');
              setInputtedName('');
            }}
          />

        </div>
      </div>

      {/* Deck Grid */}
      <div className="row">
        {filteredDecks.map((deck) => (
          <Link key={deck.id} to={`/decks/${deck.id}`}>
            <div className="col-sm-6 col-md-4">
              <Deck deck={deck} />
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}