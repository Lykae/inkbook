import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext, useNavigate } from 'react-router-dom';
//import AnimateOnChange from 'react-animate-on-change';
import { motion, AnimatePresence } from "framer-motion";

import { createDeck, updateDeck, fetchDeck } from '../features/decks/decksSlice';
//import { selectCard } from '../features/cards/cardsSlice';

import { useSearchParams } from 'react-router-dom';

import CardSearch from './card_search';
import CardViewer from './card_view';

import { getFormats } from '../constants/formats';

import { getCardKey } from '../helpers/getCardKey';

export default function NewDeck() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const selectedCard = useSelector(state => state.cards.selectedCard);
  

  const [deckName, setDeckName] = useState('');
  const [deckCreator, setDeckCreator] = useState('');
  const [deckFormat, setDeckFormat] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const [mainDeckArray, setMainDeckArray] = useState([]);
  const [maybeboardArray, setMaybeboardArray] = useState([]);

  const [error, setError] = useState(null);

  const [view, setView] = useState('search'); 
  // 'search' | 'main' | 'maybe' | 'props'
  const [isDirty, setIsDirty] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [animDir, setAnimDir] = useState('right');
  const prevView = React.useRef(view);
  
  const selectedDeck = useSelector(state => state.decks.selectedDeck);

  const [layout, setLayout] = useState('list'); // 'list' | 'grid'

  const [page, setPage] = useState(1);
  
  useEffect(() => {
    if (editId) {
      dispatch(fetchDeck(editId));
    }
  }, [editId, dispatch]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (!selectedDeck || !editId) return;

    setDeckName(selectedDeck.name || '');
    setDeckCreator(selectedDeck.creator || '');
    setDeckFormat(selectedDeck.format || '');
    setDeckDescription(selectedDeck.description || '');
    setMainDeckArray(selectedDeck.cards || []);
    setMaybeboardArray(selectedDeck.maybeboard || []);
    setIsDirty(false);
  }, [selectedDeck, editId]);

  useEffect(() => {
    if (!editId) {
      setDeckName('');
      setDeckCreator('');
      setDeckFormat('');
      setDeckDescription('');
      setMainDeckArray([]);
      setMaybeboardArray([]);
      setIsDirty(false);
    }
  }, [editId]);

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

  const groupCards = (list) => {
    return Object.values(
      list.reduce((acc, card) => {
        const key = getCardKey(card);
      
        if (!acc[key]) {
          acc[key] = { card, count: 0 };
        }
      
        acc[key].count += 1;
        return acc;
      }, {})
    );
  };

  const markDirty = (setter) => (value) => {
    setter(value);
    setIsDirty(true);
  };

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
      id: editId ? Number(editId) : undefined,
      name: deckName,
      creator: deckCreator,
      format: deckFormat,
      description: deckDescription,
      cards: mainDeckArray,
      maybeboard: maybeboardArray,
      colors: [...new Set(mainDeckArray.map(c => c.color))]
    };

    if (editId) {
      await dispatch(updateDeck(deck));
    } else {
      const result = await dispatch(createDeck(deck));
      console.log("createresult", result);  
      navigate(`/decks/new?edit=${result.payload.id}`);
    }

  }, [deckName, deckCreator, deckFormat, deckDescription, mainDeckArray, maybeboardArray, editId, dispatch, navigate]);

  

  const { setCanSave, setOnSave } = useOutletContext();
  useEffect(() => {
    setCanSave(isDirty);
    setOnSave(saveDeck);
  }, [isDirty, saveDeck, setCanSave, setOnSave]);

  //mobile card view

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

  const CardImage = ({ src, alt, extraKey }) => {
    return (
      <img
        key={extraKey ? `${src}-${extraKey}` : src}
        src={src}
        alt={alt}
        style={{ opacity: 1 }}
      />
    );
  };

  // Rendering
  const renderGrid = (list) => {
    const grouped = groupCards(list);

    return (
      <div className="card_grid">
        {grouped.map(({ card, count }) => (
          <div
            key={getCardKey(card)}
            className="card_grid_item"
            onClick={() => openViewer(list, card)}
          >
            <CardImage
              src={card.Image}
              alt={card.Name}
              extraKey={view}
            />

            <div
              className="card_grid_controls"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => decreaseCard(card)}>−</button>
                <div className="card_count_badge_grid">
                  {count}
                </div>
              <button onClick={() => increaseCard(card)}>+</button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
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
        <div key={getCardKey(card)} className="deck_row"
            onClick={() => openViewer(list, card)}>
        
          <div
            className="card_name"
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
      
          <div className="card_controls"
            onClick={(e) => e.stopPropagation()}>
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

  return (
    <div className="container deck">
      {renderError()}

      <div className="desktop_layout">

        <div className="deck_inputs row">
          <div className="deck_inputs_group">
            <label>Deck Name</label>
            <input
              value={deckName}
              onChange={(e) => markDirty(setDeckName)(e.target.value)}
            />
          </div>

          <div className="deck_inputs_group">
            <label>Created by</label>
            <input
              value={deckCreator}
              onChange={(e) => markDirty(setDeckCreator)(e.target.value)}
            />
          </div>

          <div className="deck_inputs_group">
            <label>Deck Format</label>
            <select
              value={deckFormat}
              onChange={(e) => markDirty(setDeckFormat)(e.target.value)}
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

        <div className="deck_bottom">
          <label>Description</label>
          <textarea
            value={deckDescription}
            onChange={(e) => markDirty(setDeckDescription)(e.target.value)}
          />
        </div>

        <div className="row">
          <CardSearch
            layout={layout}
            setLayout={setLayout}
            openViewer={openViewer}
            getCount={getCount}
            onIncrease={increaseCard}
            onDecrease={decreaseCard}
            page={page}
            setPage={setPage}
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

          <div className="col-sm-4 deck_output">
            <div className="deck_output_header">
              <h5>Main Deck</h5>
              <label>{mainDeckArray.length} cards</label>
            </div>

            <div className="deck_output_cards">
              {renderList(mainDeckArray, removeCard)}
            </div>
          </div>

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

      {isMobile && (
        <div className={`mobile_view_container ${animDir}`}>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ x: 300}}
              animate={{ x: 0}}
              exit={{ x: -300}}
              transition={{ duration: 0.3 }}
            >
        
          {view === 'search' && (
            <div>
              <div className="layout_switch">
                <div
                  className={`switch_track ${layout === 'grid' ? 'grid' : 'list'}`}
                  onClick={() => setLayout(prev => prev === 'list' ? 'grid' : 'list')}
                >
                  <div className="switch_thumb" />
                        
                  <i className="fa fa-list switch_icon left" />
                  <i className="fa fa-th switch_icon right" />
                </div>
              </div>
              <CardSearch
                layout={layout}
                setLayout={setLayout}
                openViewer={openViewer}
                getCount={getCount}
                onIncrease={increaseCard}
                onDecrease={decreaseCard}
                page={page}
                setPage={setPage}
              />
            </div>
          )}

          {view === 'main' && (
            <div className="deck_output">
              <div className="layout_switch">
                <div
                  className={`switch_track ${layout === 'grid' ? 'grid' : 'list'}`}
                  onClick={() => setLayout(prev => prev === 'list' ? 'grid' : 'list')}
                >
                  <div className="switch_thumb" />
                        
                  <i className="fa fa-list switch_icon left" />
                  <i className="fa fa-th switch_icon right" />
                </div>
              </div>
              <h5>Main Deck</h5>
              {layout === 'grid'
                ? renderGrid(mainDeckArray)
                : renderList(mainDeckArray, removeCard)}
            </div>
          )}

          {view === 'maybe' && (
            <div className="deck_output">
              <div className="layout_switch">
                <div
                  className={`switch_track ${layout === 'grid' ? 'grid' : 'list'}`}
                  onClick={() => setLayout(prev => prev === 'list' ? 'grid' : 'list')}
                >
                  <div className="switch_thumb" />
                        
                  <i className="fa fa-list switch_icon left" />
                  <i className="fa fa-th switch_icon right" />
                </div>
              </div>
              <h5>Maybe</h5>
              {layout === 'grid'
                ? renderGrid(maybeboardArray)
                : renderList(maybeboardArray, removeMaybeboard)}
            </div>
          )}

          {view === 'props' && (
            <div className="deck_inputs">
              <div className="deck_inputs_group">
                <label>Deck Name</label>
                <input
                  value={deckName}
                  onChange={(e) => markDirty(setDeckName)(e.target.value)}
                />
              </div>

              <div className="deck_inputs_group">
                <label>Created by</label>
                <input
                  value={deckCreator}
                  onChange={(e) => markDirty(setDeckCreator)(e.target.value)}
                />
              </div>

              <div className="deck_inputs_group">
                <label>Deck Format</label>
                <select
                  value={deckFormat}
                  onChange={(e) => markDirty(setDeckFormat)(e.target.value)}
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
            onChange={(e) => markDirty(setDeckDescription)(e.target.value)}
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
        showEditControls={true}
      />

    </div>
  );
}