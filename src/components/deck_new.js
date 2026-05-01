import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useOutletContext } from 'react-router-dom';
//import AnimateOnChange from 'react-animate-on-change';
import { motion, AnimatePresence } from "framer-motion";

import { createDeck } from '../features/decks/decksSlice';
//import { selectCard } from '../features/cards/cardsSlice';

import CardSearch from './card_search';
import CardViewer from './card_view';

import { getFormats } from '../constants/formats';

export default function NewDeck() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedCard = useSelector(state => state.cards.selectedCard);

  const [deckName, setDeckName] = useState('');
  const [deckCreator, setDeckCreator] = useState('');
  const [deckFormat, setDeckFormat] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const [mainDeckArray, setMainDeckArray] = useState([]);
  //const [sideboardArray, setSideboardArray] = useState([]);
  const [maybeboardArray, setMaybeboardArray] = useState([]);

  const [error, setError] = useState(null);

  const [view, setView] = useState('search'); 
  // 'search' | 'main' | 'maybe' | 'props'
  const [isDirty, setIsDirty] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [animDir, setAnimDir] = useState('right');
  const prevView = React.useRef(view);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // -------------------------
  // CARD ACTIONS (kept simple)
  // -------------------------
  
  //const addCard = (card) => {
  //  setMainDeckArray(prev => [...prev, card]);
  //};
//
  //const addFour = (card) => {
  //  setMainDeckArray(prev => [...prev, card, card, card, card]);
  //};
//
  //const addSideboard = (card) => {
  //  setSideboardArray(prev => [...prev, card]);
  //};

  const changeView = (next) => {
    if (next === view) return;

    setAnimDir(
      next === 'search' ? 'left' :
      next === 'main' ? 'left' :
      next === 'maybe' ? 'right' :
      'right'
    );

    prevView.current = view;
    setView(next);
  };

  const addMaybeboard = (card) => {
    setMaybeboardArray(prev => [...prev, card]);
    setIsDirty(true);
  };

  const removeCard = (card) => {
    const key = getCardKey(card);

    setMainDeckArray(prev => {
      const index = prev.findIndex(c => getCardKey(c) === key);
      if (index === -1) return prev;

      return [
        ...prev.slice(0, index),
        ...prev.slice(index + 1)
      ];
    });
    setIsDirty(true);
  };

  const removeMaybeboard = (card) => {
    const key = getCardKey(card);

    setMaybeboardArray(prev => {
      const index = prev.findIndex(c => getCardKey(c) === key);
      if (index === -1) return prev;

      return [
        ...prev.slice(0, index),
        ...prev.slice(index + 1)
      ];
    });
    setIsDirty(true);
  };

  // -------------------------
  // SAVE
  // -------------------------
  const saveDeck = useCallback(async () => {
    if (!deckName) return setError('name');
    if (!deckFormat) return setError('format');
    if (mainDeckArray.length === 0) return setError('cards');

    const deck = {
      name: deckName,
      creator: deckCreator,
      format: deckFormat,
      description: deckDescription,
      cards: mainDeckArray,
      maybeboard: maybeboardArray,
      colors: [...new Set(mainDeckArray.map(c => c.color))]
    };

    await dispatch(createDeck(deck));
    navigate('/decks');
  }, [
    deckName,
    deckCreator,
    deckFormat,
    deckDescription,
    mainDeckArray,
    maybeboardArray,
    dispatch,
    navigate
  ]);

  

  const { setCanSave, setOnSave } = useOutletContext();
  useEffect(() => {
    setCanSave(isDirty);
    setOnSave(() => saveDeck);
  }, [isDirty, saveDeck, setCanSave, setOnSave]);

  //mobile card view
  const getCardKey = (c) => (`${c.Name}-${c.Set_Name}`);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerCards, setViewerCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openViewer = (cardsArray, clickedCard) => {
    const seen = new Map();

    const uniqueCards = cardsArray.filter((c) => {
      const key = getCardKey(c);
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });

    const index = uniqueCards.findIndex(
      c => (c.Name || c.name) === (clickedCard.Name || clickedCard.name)
    );

    setViewerCards(uniqueCards);
    setCurrentIndex(index >= 0 ? index : 0);

    if (window.innerWidth < 768) {
      setViewerOpen(true);
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setCurrentIndex(0);
  };

  const getCount = (card) => {
    const key = getCardKey(card);
    return mainDeckArray.filter(c => getCardKey(c) === key).length;
  };

  const increaseCard = (card) => {
    setMainDeckArray(prev => [...prev, card]);
    setIsDirty(true);
  };

  const decreaseCard = (card) => {
    if (getCount(card) === 0) return;
    const key = getCardKey(card);
    
    setMainDeckArray(prev => {
      const index = prev.findIndex(c => getCardKey(c) === key);
      if (index === -1) return prev;
    
      return [
        ...prev.slice(0, index),
        ...prev.slice(index + 1)
      ];
    });
    setIsDirty(true);
  };

  // -------------------------
  // ERROR UI (preserved logic)
  // -------------------------
  const renderError = () => {
    if (!error) return null;

    const messages = {
      name: '*Please give your deck a name',
      format: '*Please give your deck a format',
      cards: '*Please give your deck some cards'
    };

    return <div className="row error">{messages[error]}</div>;
  };

  // -------------------------
  // RENDER LIST (keeps structure minimal change)
  // -------------------------
  const renderList = (list, removeFn) => {
  const grouped = list.reduce((acc, card) => {
    const key = getCardKey(card);

    if (!acc[key]) {
      acc[key] = { card, count: 0 };
    }

    acc[key].count += 1;
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => (a.card.Name || '').localeCompare(b.card.Name || ''))
    .map(({ card, count }) => (
      <div key={getCardKey(card)} className="deck_row">

        <div
          className="card_name"
          onClick={() => openViewer(list, card)}
        >
          <strong className="card_title">

            <span
              className={`card_count ${card.Inkable ? 'inkable' : 'not_inkable'}`}
            >
              {count}
            </span>

            {card.Name}

          </strong>
        </div>

        <div className="card_controls">
          <button
            className="ctrl_btn minus"
            onClick={() => decreaseCard(card)}
          >
            −
          </button>

          <span className="count_display">{count}</span>

          <button
            className="ctrl_btn plus"
            onClick={() => increaseCard(card)}
          >
            +
          </button>
        </div>

      </div>
    ));
};

  // -------------------------
  // UI (CSS STRUCTURE RESTORED)
  // -------------------------
  return (
    <div className="container deck">
      {renderError()}

      {/* ========================= */}
      {/* DESKTOP LAYOUT (ALWAYS RENDERED) */}
      {/* ========================= */}
      <div className="desktop_layout">

        <div className="deck_inputs row">
          <div className="deck_inputs_group">
            <label>Deck Name</label>
            <input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>

          <div className="deck_inputs_group">
            <label>Created by</label>
            <input
              value={deckCreator}
              onChange={(e) => setDeckCreator(e.target.value)}
            />
          </div>

          <div className="deck_inputs_group">
            <label>Deck Format</label>
            <select
              value={deckFormat}
              onChange={(e) => setDeckFormat(e.target.value)}
            >
              <option value="">Select Format</option>
              {getFormats().map(format => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>
        </div>

        

        {/* DESCRIPTION */}
        <div className="deck_bottom">
          <label>Description</label>
          <textarea
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
          />
        </div>

        <div className="row">

          {/* SEARCH */}
          <CardSearch openViewer={openViewer}
            getCount={getCount}
            onIncrease={increaseCard}
            onDecrease={decreaseCard}
          />

          <div className="col-sm-4 selected_card">

            {!selectedCard && (
              <h5>To begin, please search for a card.</h5>
            )}

            {selectedCard && (
              <div>
              
                <div className="selected_card_image">
                  <img
                    src={selectedCard.Image}
                    alt={selectedCard.Name}
                    onClick={() => openViewer([selectedCard], selectedCard)}
                  />
                </div>
            
                <div className="selected_card_details">
            
                  <div className="selected_card_details_head">
                    <strong>{selectedCard.Name}</strong>
                  </div>
            
                  <div className="selected_card_buttons">
            
                    <button onClick={() => decreaseCard(selectedCard)}>
                      −
                    </button>
            
                    <span className="card-count">
                      {getCount(selectedCard)}
                    </span>
            
                    <button onClick={() => increaseCard(selectedCard)}>
                      +
                    </button>
            
                    <button onClick={() => addMaybeboard(selectedCard)}>
                      +?
                    </button>
            
                  </div>
            
                </div>
              </div>
            )}

          </div>

          {/* MAIN DECK */}
          <div className="col-sm-4 deck_output">
            <div className="deck_output_header">
              <h5>Main Deck</h5>
              <label>{mainDeckArray.length} cards</label>
            </div>

            <div className="deck_output_cards">
              {renderList(mainDeckArray, removeCard)}
            </div>
          </div>

          {/* MAYBE */}
          <div className="col-sm-4 deck_output">
            <div className="deck_output_header">
              <h5>Maybe</h5>
              <label>{maybeboardArray.length} cards</label>
            </div>

            <div className="deck_output_cards">
              {renderList(maybeboardArray, removeMaybeboard)}
            </div>
          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* MOBILE VIEW SWITCHER */}
      {/* ========================= */}
      {isMobile && (
        <div className={`mobile_view_container ${animDir}`}>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
        
          {view === 'search' && <CardSearch openViewer={openViewer} />}

          {view === 'main' && (
            <div className="deck_output">
              <h5>Main Deck</h5>
              {renderList(mainDeckArray, removeCard)}
            </div>
          )}

          {view === 'maybe' && (
            <div className="deck_output">
              <h5>Maybe</h5>
              {renderList(maybeboardArray, removeMaybeboard)}
            </div>
          )}

          {view === 'props' && (
            <div className="deck_inputs">
              <div className="deck_inputs_group">
                <label>Deck Name</label>
                <input
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                />
              </div>

              <div className="deck_inputs_group">
                <label>Created by</label>
                <input
                  value={deckCreator}
                  onChange={(e) => setDeckCreator(e.target.value)}
                />
              </div>

              <div className="deck_inputs_group">
                <label>Deck Format</label>
                <select
                  value={deckFormat}
                  onChange={(e) => setDeckFormat(e.target.value)}
                >
                  <option value="">Select Format</option>
                  {getFormats().map(format => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              

        {/* DESCRIPTION */}
        <div className="deck_bottom">
          <label>Description</label>
          <textarea
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
          />
        </div>

            </div>
          )}

          </motion.div>
        </AnimatePresence>
        </div>
      )}

      {/* ========================= */}
      {/* MOBILE BOTTOM NAV */}
      {/* ========================= */}
      {isMobile && (
        <div className="mobile_bottombar">
        
          <button onClick={() => changeView('props')} className="nav_btn">
            <i className="fa fa-cog" />
          </button>

          <button onClick={() => changeView('search')} className="nav_btn">
            <i className="fa fa-search" />
          </button>

          <button onClick={() => changeView('main')} className="nav_btn">
            <i className="fa fa-list" />
          </button>

          <button onClick={() => changeView('maybe')} className="nav_btn">
            <i className="fa fa-star-o" />
          </button>

        </div>
      )}

      {/* CARD VIEWER */}
      <CardViewer
        open={viewerOpen}
        cards={viewerCards}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        onClose={handleCloseViewer}
        onAddMaybeboard={addMaybeboard}
        getCount={getCount}
        onIncrease={increaseCard}
        onDecrease={decreaseCard}
      />

    </div>
  );
}