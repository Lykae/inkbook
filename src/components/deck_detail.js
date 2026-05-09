import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CardViewer from './card_view';

import { fetchDeck, deleteDeck } from '../features/decks/decksSlice';

import SampleHand from './sample_hand';
import ColorChart from './color_chart';
import CmcChart from './cmc_chart';

import { getCardKey } from '../helpers/getCardKey';

export default function DeckDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deck = useSelector(state => state.decks.selectedDeck);

  const [showSort, setShowSort] = useState(false);

  const [sortDraft, setSortDraft] = useState({
    orderby: '',
    direction: 'asc'
  });

  const [sort, setSort] = useState({
    orderby: '',
    direction: 'asc'
  });

  const [viewerState, setViewerState] = useState({
    cards: [],
    index: 0
  });

  useEffect(() => {
    dispatch(fetchDeck(id));
  }, [id, dispatch]);

  //const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [view, setView] = useState('stats'); 

  //useEffect(() => {
  //  const handler = () => setIsMobile(window.innerWidth < 768);
  //  window.addEventListener('resize', handler);
  //  return () => window.removeEventListener('resize', handler);
  //}, []);

  const [viewerOpen, setViewerOpen] = useState(false);

  const [layout, setLayout] = useState('list'); // 'list' | 'grid'

  const cardList = useMemo(() => {
    return (deck?.cards || []).map((c) => ({
      ...c,
      name: c.name || c.Name,
      cost: c.cost ?? c.Cost,
      set_name: c.set_name || c.Set_Name,
      image: c.image || c.Image
    }));
  }, [deck?.cards]);

  const sortCards = useCallback((cards) => {
    if (!sort.orderby) return cards;

    const sorted = [...cards];

    sorted.sort((a, b) => {
      let aVal;
      let bVal;

      switch (sort.orderby) {
        case 'cost':
          aVal = a.cost ?? a.Cost ?? 0;
          bVal = b.cost ?? b.Cost ?? 0;
          break;

        case 'strength':
          aVal = a.Strength || 0;
          bVal = b.Strength || 0;
          break;

        case 'lore':
          aVal = a.Lore || 0;
          bVal = b.Lore || 0;
          break;

        case 'name':
          aVal = a.name || a.Name || '';
          bVal = b.name || b.Name || '';

          return sort.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);

        case 'color':
          aVal = a.Color || '';
          bVal = b.Color || '';

          return sort.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);

        case 'rarity':
          aVal = a.Rarity || '';
          bVal = b.Rarity || '';

          return sort.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);

        default:
          return 0;
      }

      return sort.direction === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    });

    return sorted;
  }, [sort]);

  const maybeList = useMemo(() => {
      return (deck?.maybeboard || []).map((c) => ({
        ...c,
        name: c.name || c.Name,
        cost: c.cost ?? c.Cost,
        set_name: c.set_name || c.Set_Name,
        image: c.image || c.Image
      }));
    }, [deck?.maybeboard]);

    const viewerCards = useMemo(() => {
    const map = new Map();

    for (const card of sortCards(cardList)) {
      const key = getCardKey(card);

      if (!map.has(key)) {
        map.set(key, { ...card, _key: key });
      }
    }

    return Array.from(map.values());
  }, [cardList, sortCards]);

  const maybeViewerCards = useMemo(() => {
    const map = new Map();

    for (const card of sortCards(maybeList)) {
      const key = getCardKey(card);

      if (!map.has(key)) {
        map.set(key, { ...card, _key: key });
      }
    }

    return Array.from(map.values());
  }, [maybeList, sortCards]);

  const handleCardClick = (card, source = viewerCards) => {
    const cardsSnapshot = [...source];
    const key = getCardKey(card);
    
    const index = cardsSnapshot.findIndex(c => getCardKey(c) === key);
    
    setViewerState({
      cards: cardsSnapshot,
      index: index >= 0 ? index : 0
    });
  
    setViewerOpen(true);
  };

  const handleDeleteDeck = async () => {
    const confirmed = window.confirm(
      `Delete "${deck.name}"?`
    );
  
    if (!confirmed) return;
  
    try {
      await dispatch(deleteDeck(deck.id)).unwrap();
    
      navigate('/decks');
    } catch (err) {
      console.error(err);
      alert('Failed to delete deck.');
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setViewerState({
      cards: [],
      index: 0
    });
  };

  const handleExport = () => {
    if (!cardList.length) return;

    // group cards
    const counts = {};

    cardList.forEach(card => {
      const key = getCardKey(card);

      if (!counts[key]) {
        counts[key] = { name: card.name, count: 0 };
      }

      counts[key].count++;
    });

    // build export string
    const exportText = Object.values(counts)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name, count }) => `${count} ${name}`)
      .join('\n');

    // copy to clipboard
    navigator.clipboard.writeText(exportText);

    alert('Deck copied to clipboard!');
  };

  const renderGrid = (list, source = viewerCards) => {
    const grouped = Object.values(
      list.reduce((acc, card) => {
        const key = getCardKey(card);

        if (!acc[key]) {
          acc[key] = {
            card,
            count: 0
          };
        }

        acc[key].count++;
        return acc;
      }, {})
    );

    return (
      <div className="mobile_card_grid">
        {grouped.map(({ card, count }) => (
          <div
            key={getCardKey(card)}
            className="mobile_card_item"
            onClick={() => handleCardClick(card, source)}
          >
            <img src={card.image} alt={card.name} />

            <div className="card_grid_controls">
              <div className="card_count_badge_grid">
                {count}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderList = (list, isMaybe = false) => {
    const grouped = Object.values(
      list.reduce((acc, card) => {
        const key = getCardKey(card);
      
        if (!acc[key]) {
          acc[key] = {
            card,
            count: 0,
            key
          };
        }
      
        acc[key].count++;
        return acc;
      }, {})
    );

    return Object.values(grouped)
      //.sort((a, b) => a.card.name.localeCompare(b.card.name))
      .map(({ card, count }) => (
        <div key={getCardKey(card)} className="deck_row" 
            onClick={() => handleCardClick(card, isMaybe === true ? maybeViewerCards : viewerCards)}>
        
          <div className="card_name">
            <strong className="card_title">

              <span
                className={`card_count ${card.Inkable ? 'inkable' : 'not_inkable'}`}
              >
                {card.cost}
              </span>

              {card.name}

            </strong>
          </div>

          <div className="card_controls">
            <span className="count_display">{count}</span>
          </div>

        </div>
      ));
  };

  //const renderCardsColumn = () => (
  //  <div className="deck_output">
  //    <div className="deck_output_header">
  //      <h5>Main Deck</h5>
  //      <label>{cardList.length} cards</label>
  //    </div>
//
  //    <div className="deck_output_cards">
  //      {renderList(cardList)}
  //    </div>
  //  </div>
  //);
//
  //const renderViewerColumn = () => (
  //  <div className="deck_detail_active_card">
  //    <AnimateOnChange
  //      baseClassName="active-card"
  //      animationClassName="active-card-animate"
  //      animate={true}
  //    >
  //      <img src={activeCard.image} alt={activeCard.name} />
  //    </AnimateOnChange>
  //  </div>
  //);

  const renderStatsColumn = () => (
    <>
    <div className="deck">

      {/* HEADER */}
      <div className="deck_output">
      
        <div className="deck_output_header">
          <h5>{deck.name}</h5>
          <label>{deck.format} • {deck.cards?.length || 0} cards</label>
        </div>
      
        {deck.description && (
          <div className="stats_description">
            {deck.description}
          </div>
        )}
      
        {/* CONTENT GRID */}
        <div className="stats_grid">
        
          <div className="piechart_container">
            <div className="stats_header">
              Colors
            </div>
            <div className="piechart">
              <ColorChart deck={deck} />
            </div>
          </div>
        
          <div>
            <div className="stats_header">
              Curve
            </div>
            <div>
              <CmcChart deck={deck} />
            </div>
          </div>
        
        </div>
      </div>
      
    </div>
    </>
  );

  const renderTools = () => (
    <>
      <div className="deck_output">
        <div className="deck_output_header">
          <h5>Tools</h5>
          <label>Deck utilities</label>
        </div>

        <div>
          <Link to={`/proxy/${id}`} className="proxy-button">
            Print proxies
          </Link>

          <button
            onClick={handleExport}
            className="proxy-button"
          >
            Export deck
          </button>

          <button
            onClick={handleDeleteDeck}
            className="proxy-button delete_button"
          >
            Delete deck
          </button>

          <SampleHand deck={deck} handleCardClick={handleCardClick} />
        </div>
      </div>
    </>
  );

  const getCount = (card) => {
    if (!card) return 0;

    const key = getCardKey(card);

    return cardList.filter(c => {
      const cKey = getCardKey(c);
      return cKey === key;
    }).length;
  };

  if (!deck) {
    return <h3 className="loading">loading deck...</h3>;
  }

  //const creator = deck.creator || 'Anonymous';

  return (
    <div className="container deck_detail">
      <div className="mobile_view_container">
      
        {view === 'cards' && (
          <div className="deck_output">
            <div className="layout_switch_detail">
              <div
                className={`switch_track ${layout === 'grid' ? 'grid' : 'list'}`}
                onClick={() =>
                  setLayout(prev => prev === 'list' ? 'grid' : 'list')
                }
              >
                <div className="switch_thumb" />
              
                <i className="fa fa-list switch_icon left" />
                <i className="fa fa-th switch_icon right" />
              </div>
            </div>
            <div className="deck_output_header">
              <div className="deck_output_header_text">
                <h5>Main Deck</h5>
              </div>
                    
              <button
                className="advanced_btn_detail"
                onClick={() => setShowSort(true)}
              >
                <i className="fa fa-sort" />
              </button>
            </div>

            <div className="deck_output_cards">
              {layout === 'grid'
                ? renderGrid(sortCards(cardList), viewerCards)
                : renderList(sortCards(cardList))}
            </div>
          </div>
        )}

        {view === 'stats' && renderStatsColumn()}

        {view === 'maybe' && (
          <div className="deck_output">
            <div className="layout_switch_detail">
              <div
                className={`switch_track ${layout === 'grid' ? 'grid' : 'list'}`}
                onClick={() =>
                  setLayout(prev => prev === 'list' ? 'grid' : 'list')
                }
              >
                <div className="switch_thumb" />
              
                <i className="fa fa-list switch_icon left" />
                <i className="fa fa-th switch_icon right" />
              </div>
            </div>
            <div className="deck_output_header">
              <div className="deck_output_header_text">
                <h5>Maybe</h5>
              </div>

              <button
                className="advanced_btn_detail"
                onClick={() => setShowSort(true)}
              >
                <i className="fa fa-sort" />
              </button>
            </div>
                  
            <div className="deck_output_cards">
              {layout === 'grid'
                ? renderGrid(sortCards(maybeList), maybeViewerCards)
                : renderList(sortCards(maybeList), true)}
            </div>
          </div>
        )}

        {view === 'tools' && renderTools()}

      </div>

      <div className="mobile_bottombar">
        
        <button onClick={() => setView('stats')} className="nav_btn">
          <i className="fa fa-bar-chart" />
        </button>
      
        <button onClick={() => setView('cards')} className="nav_btn">
          <i className="fa fa-list" />
        </button>
        
        <button onClick={() => setView('maybe')} className="nav_btn">
          <i className="fa fa-star-o" />
        </button>

        <button onClick={() => setView('tools')} className="nav_btn">
          <i className="fa fa-magic" />
        </button>
        
      </div>

      {showSort && (
        <div
          className="advanced_overlay"
          onClick={() => setShowSort(false)}
        >
          <div
            className="advanced_modal"
            onClick={(e) => e.stopPropagation()}
          >
          
            <div className="advanced_grid">

              <div className="filter_row">

                <div className="filter_field">
                  <label>Sort By</label>

                  <select
                    value={sortDraft.orderby}
                    onChange={e =>
                      setSortDraft(s => ({
                        ...s,
                        orderby: e.target.value
                      }))
                    }
                  >
                    <option value="">None</option>
                    <option value="cost">Cost</option>
                    <option value="strength">Strength</option>
                    <option value="lore">Lore</option>
                    <option value="name">Name</option>
                    <option value="rarity">Rarity</option>
                    <option value="color">Color</option>
                  </select>
                </div>
                  
                <div className="filter_field">
                  <label>Direction</label>
                  
                  <select
                    value={sortDraft.direction}
                    disabled={!sortDraft.orderby}
                    onChange={e =>
                      setSortDraft(s => ({
                        ...s,
                        direction: e.target.value
                      }))
                    }
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                  
              </div>
                  
            </div>
                  
            <div className="advanced_actions">
                  
              <button
                onClick={() => {
                  setSortDraft({
                    orderby: '',
                    direction: 'asc'
                  });
                }}
              >
                Reset
              </button>
              
              <button
                onClick={() => {
                  setSort(sortDraft);
                  setShowSort(false);
                }}
              >
                Apply
              </button>
              
            </div>
              
          </div>
        </div>
      )}

      <CardViewer
        open={viewerOpen}
        cards={viewerState.cards}
        currentIndex={viewerState.index}
        setCurrentIndex={(i) =>
          setViewerState(s => ({ ...s, index: i }))
        }
        onClose={handleCloseViewer}
        showEditControls={false}
        getCount={getCount}
      />

    </div>
  );
}