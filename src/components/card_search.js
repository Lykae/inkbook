import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { fetchCards, selectCard } from '../features/cards/cardsSlice';

export default function CardSearch({
  layout,
  setLayout,
  openViewer,
  getCount,
  onIncrease,
  onDecrease,
  page,
  setPage
}) {
  const dispatch = useDispatch();
  const foundCards = useSelector(state => state.cards.foundCards);

  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const pageSize = 100;
  const hasNextPage = foundCards.length === pageSize;

  const [filtersDraft, setFiltersDraft] = useState({
    color: '',
    type: '',
    rarity: '',
    inkable: '',
    minCost: '',
    maxCost: '',
    minStrength: '',
    maxStrength: '',
    minLore: '',
    maxLore: '',
    set: '',
    regexText: ''
  });

  const [filters, setFilters] = useState(filtersDraft);

  const [term, setTerm] = useState('');
  

  //const search = useCallback(
  //  _.debounce((term) => {
  //    if (term && term.trim() !== '') {
  //      dispatch(fetchCards({ name: term }));
  //      setSearchSubmitted(true);
  //    }
  //  }, 300),
  //  []
  //);

  const loading = useSelector(state => state.cards.loading);

  const applyRegexFilter = (cards, regexText) => {
    if (!regexText) return cards;

    try {
      const regex = new RegExp(regexText, 'i');

      return cards.filter(card => {
        const text = card.Body_Text || '';
        return regex.test(text);
      });

    } catch (err) {
      // invalid regex
      return cards;
    }
  };

  const filteredCards = applyRegexFilter(foundCards, filters.regexText);

  //const search = useCallback(
  //  _.debounce((term) => {
  //    if (!term?.trim()) return;
//
  //    dispatch(fetchCards(buildQuery(term)));
  //    setSearchSubmitted(true);
  //  }, 300),
  //  [filters]
  //);

  //const search = useCallback(
  //  _.debounce((term) => {
  //    if (!term?.trim()) return;
//
  //    const searchString = buildSearchString(term, filters);
//
  //    dispatch(fetchCards({
  //      name: term,
  //      color: filters.color || undefined,
  //      type: filters.type || undefined,
  //      rarity: filters.rarity || undefined,
  //      inkable:
  //        filters.inkable === ''
  //          ? undefined
  //          : filters.inkable === 'true',
  //      cost: undefined
  //    }));
//
  //    setSearchSubmitted(true);
  //  }, 300),
  //  [filters, dispatch]
  //);

  const searchRef = useRef(
    _.debounce((term, filters, page = 1) => {
      dispatch(fetchCards({
        name: term?.trim() ? term : undefined,
        color: filters.color || undefined,
        type: filters.type || undefined,
        rarity: filters.rarity || undefined,
        inkable:
          filters.inkable === ''
            ? undefined
            : filters.inkable === 'true',
        page
      }));
    }, 300)
  );

  const runSearch = (nextTerm = term, nextFilters = filters, nextPage = page) => {
    searchRef.current(nextTerm, nextFilters, nextPage);
  };

  const handleApply = () => {
    setFilters(filtersDraft);
    setPage(1);
    runSearch(term, filtersDraft, 1);
    setShowAdvanced(false);
  };

  const handleReset = () => {
    setFiltersDraft({
      color: '',
      type: '',
      rarity: '',
      inkable: '',
      minCost: '',
      maxCost: '',
      minStrength: '',
      maxStrength: '',
      minLore: '',
      maxLore: '',
      set: '',
      regexText: ''
    });
  };

  useEffect(() => {
    if (showAdvanced) {
      setFiltersDraft(filters);
    }
  }, [showAdvanced]);

  //useEffect(() => {
  //  runSearch(term, filters, page);
  //}, [page]);
//
  //useEffect(() => {
  //  if (page < 1) setPage(1);
  //}, [page]);

  const renderGrid = () => (
    <div className="card_grid">
      {filteredCards.map((card, i) => (
        <div
          key={`${card.Name}-${card.Set_Name}-${i}`}
          className="card_grid_item"
          onClick={() => {
            dispatch(selectCard(card));
            openViewer(filteredCards, card);
          }}
        >
          <img src={card.Image} alt={card.Name} />

          <div
            className="card_grid_controls"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => onDecrease(card)}>−</button>
              <div className="card_count_badge_grid">
                {getCount(card)}
              </div>
            <button onClick={() => onIncrease(card)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="card_search col-sm-4">
      <div className="search_topbar">
        <h4>Search Cards</h4>
    
        <div className="search_controls">
    
          {/* advanced filters */}
          <button
            className="advanced_btn"
            onClick={() => setShowAdvanced(true)}
          >
            <i className="fa fa-sliders" />
          </button>
    
        </div>
      </div>

      <input
        placeholder="Elsa"
        onChange={(e) => {
          setTerm(e.target.value);
          setPage(1);
          runSearch(e.target.value, filters, 1);;
        }}
      />

      {layout === 'grid' ? (
          renderGrid()
        ) : (
      <ul>
        {loading ? (
          <div className="search_loading">
            Loading cards...
          </div>
        ) : (
          <>
            {filteredCards?.length < 1 && searchSubmitted ? (
              <span className="error">No cards found.</span>
            ) : (
              filteredCards?.map((card, i) => (
                <li
                  key={`${card.Name}-${card.Set_Name}-${i}`}
                  className="deck_row search_row"
                  onClick={() => {
                    dispatch(selectCard(card));
                    if (openViewer) openViewer(filteredCards, card);
                  }}
                >
                  <div
                    className="card_name"
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
                  
                  <div className="card_controls"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      className="ctrl_btn minus"
                      onClick={(e) => {
                        e.stopPropagation();
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
                        e.stopPropagation();
                        onIncrease(card);
                      }}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))
            )}
          </>
        )}
      </ul>
      )}

      {!loading && filteredCards?.length > 0 && (
        <div className="pagination_controls">
          <button
            className="pagination_button"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            className="pagination_button"
            disabled={!hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showAdvanced && (
        <div
          className="advanced_overlay"
          onClick={() => setShowAdvanced(false)}
        >
          <div
            className="advanced_modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Advanced Filters</h4>
            
            <div className="advanced_grid">
            
              <input
                placeholder="Color"
                value={filtersDraft.color}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, color: e.target.value }))
                }
              />

              <input
                placeholder="Type"
                value={filtersDraft.type}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, type: e.target.value }))
                }
              />

              <input
                placeholder="Rarity"
                value={filtersDraft.rarity}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, rarity: e.target.value }))
                }
              />
      
              <select
                value={filtersDraft.inkable}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, inkable: e.target.value }))
                }
              >
                <option value="">Inkable?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            
              <input
                placeholder="Min Cost"
                type="number"
                value={filters.minCost}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, color: e.target.value }))
                }
              />
      
              <input
                placeholder="Max Cost"
                type="number"
                value={filters.maxCost}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, color: e.target.value }))
                }
              />
      
              <input
                placeholder="Set Name"
                value={filters.set}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, color: e.target.value }))
                }
              />
      
              <input
                placeholder="Regex in body text"
                value={filters.regexText}
                onChange={e =>
                  setFiltersDraft(f => ({ ...f, color: e.target.value }))
                }
              />
      
            </div>
            
            <div className="advanced_actions">
              <button onClick={handleReset}>
                Reset
              </button>
                            
              <button onClick={handleApply}>
                Apply
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
    
  );
}