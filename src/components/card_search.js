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
    color: [],
    type: '',
    rarity: [],
    inkable: '',
    minCost: '',
    maxCost: '',
    minStrength: '',
    maxStrength: '',
    minLore: '',
    maxLore: '',
    set: [],
    regexText: ''
  });

  const [filters, setFilters] = useState(filtersDraft);

  const [term, setTerm] = useState('');

  const SET_OPTIONS = [
    { key: 'The First Chapter', label: 'Set 1' },
    { key: 'Rise of The Floodborn', label: 'Set 2' },
    { key: 'Into The Inklands', label: 'Set 3' },
    { key: "Ursula's Return", label: 'Set 4' },
    { key: 'Shimmering Skies', label: 'Set 5' },
    { key: 'Azurite Sea', label: 'Set 6' },
    { key: "Archazia's Island", label: 'Set 7' },
    { key: 'Reign of Jafar', label: 'Set 8' },
    { key: 'Fabled', label: 'Set 9' },
    { key: 'Whispers in the Well', label: 'Set 10' },
    { key: 'Winterspell', label: 'Set 11' },
    { key: 'Wilds Unknown', label: 'Set 12' },
    { key: 'Lorcana Promos', label: 'Promo' }
  ];

  const TYPE_OPTIONS = [
    'Characters',
    'Actions',
    'Songs',
    'Items',
    'Locations'
  ];
  
  const COLOR_OPTIONS = [
    'amber',
    'emerald',
    'ruby',
    'sapphire',
    'steel',
    'amethyst'
  ];

  const RARITY_OPTIONS = [
    { key: 'Common', label: 'Com', icon: 'circle' },
    { key: 'Uncommon', label: 'Unc', icon: 'book' },
    { key: 'Rare', label: 'Rar', icon: 'triangle' },
    { key: 'Super Rare', label: 'Sup', icon: 'diamond' },
    { key: 'Legendary', label: 'Leg', icon: 'pentagon' },
    { key: 'Epic', label: 'Epi', icon: 'star' },
    { key: 'Enchanted', label: 'Enc', icon: 'hexagon' },
    { key: 'Iconic', label: 'Ico', icon: 'flower' },
    { key: 'Promo', label: 'Pro', icon: 'link' }
  ];

  const RarityIcon = ({ type, active }) => {
    const color = active ? '#F6BE00' : '#666';
    const size = 18;
    const stroke = 2;

    const commonProps = {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: stroke,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    };

    switch (type) {
      case 'circle':
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="8" />
          </svg>
        );

      case 'book':
        return (
          <svg {...commonProps}>
            <path d="M6 4h6a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H6z" />
            <path d="M18 4h-6a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h6z" />
          </svg>
        );

      case 'triangle':
        return (
          <svg {...commonProps}>
            <path d="M12 4l8 16H4z" />
          </svg>
        );

      case 'diamond':
        return (
          <svg {...commonProps}>
            <path d="M12 3l7 9-7 9-7-9z" />
          </svg>
        );

      case 'pentagon':
        return (
          <svg {...commonProps}>
            <path d="M12 3l9 7-3 11H6L3 10z" />
          </svg>
        );

      case 'hexagon':
        return (
          <svg {...commonProps}>
            <path d="M7 4h10l4 8-4 8H7L3 12z" />
          </svg>
        );

      case 'star':
        return (
          <svg {...commonProps}>
            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
          </svg>
        );

      case 'flower':
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="18" r="2" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="18" cy="12" r="2" />
          </svg>
        );

      case 'link':
        return (
          <svg {...commonProps}>
            <path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1" />
            <path d="M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1" />
          </svg>
        );

      default:
        return null;
    }
  };

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

  const buildSearchString = (filters) => {
    const clauses = [];

    if (filters.color?.length) {
      if (filters.color.length === 1) {
        clauses.push(`color=${filters.color[0]}`);
      } else {
        clauses.push(
          `(${filters.color.map(c => `color=${c}`).join(';|')};)`
        );
      }
    }
    if (filters.type) clauses.push(`type=${filters.type}`);
    if (filters.rarity.length > 0) {
      if (filters.rarity.length === 1) {
        clauses.push(`rarity=${filters.rarity[0]}`);
      } else {
        clauses.push(
          `(${filters.rarity.map(r => `rarity=${r}`).join(';|')};)`
        );
      }
    }

    if (filters.inkable !== '') {
      clauses.push(
        `inkable=${filters.inkable === 'true' ? 1 : 0}`
      );
    }

    if (filters.minCost) clauses.push(`cost>=${filters.minCost}`);
    if (filters.maxCost) clauses.push(`cost<=${filters.maxCost}`);

    if (filters.minStrength) clauses.push(`strength>=${filters.minStrength}`);
    if (filters.maxStrength) clauses.push(`strength<=${filters.maxStrength}`);

    if (filters.minLore) clauses.push(`lore>=${filters.minLore}`);
    if (filters.maxLore) clauses.push(`lore<=${filters.maxLore}`);

    if (filters.set?.length) {
      if (filters.set.length === 1) {
        clauses.push(`set_name~${filters.set[0]}`);
      } else {
        clauses.push(
          `(${filters.set.map(s => `set_name~${s}`).join(';|')};)`
        );
      }
    }

    return clauses.join(';');
  };

  const searchRef = useRef(
    _.debounce((term, filters, page = 1) => {
      const search = buildSearchString(filters);

      console.log('SEARCH STRING:', search);

      dispatch(fetchCards({
        name: term?.trim() ? term : undefined,
        search: search || undefined,
        page
      }));
    }, 300)
  );

  const runSearch = (nextTerm = term, nextFilters = filters, nextPage = page) => {
    setSearchSubmitted(true);
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
      color: [],
      type: '',
      rarity: [],
      inkable: '',
      minCost: '',
      maxCost: '',
      minStrength: '',
      maxStrength: '',
      minLore: '',
      maxLore: '',
      set: [],
      regexText: ''
    });
  };

  useEffect(() => {
    if (showAdvanced) {
      setFiltersDraft(filters);
    }
  }, [showAdvanced, filters]);

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
            onClick={() => {
              setPage(p => {
                const next = Math.max(1, p - 1);
                runSearch(term, filters, next);
                return next;
              });
            }}
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            className="pagination_button"
            disabled={!hasNextPage}
            onClick={() => {
              setPage(p => {
                const next = p + 1;
                runSearch(term, filters, next);
                return next;
              });
            }}
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
            
            <div className="advanced_grid">

              {/* ROW 1 */}
              <div className="filter_row">
                <div className="filter_field">
                  <label>Colors</label>
                  <div className="color_toggle_row">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color_toggle ${filtersDraft.color.includes(color) ? 'active' : ''}`}
                        onClick={() => {
                          setFiltersDraft(f => {
                            const already = f.color.includes(color);
                          
                            const next = already
                              ? f.color.filter(c => c !== color)
                              : [...f.color, color];
                          
                            return { ...f, color: next };
                          });
                        }}
                      >
                        <img
                          src={`/img/${color}.png`}
                          alt={color}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              
              {/* ROW 2 */}
              <div className="filter_row">
                <div className="filter_field">
                  <label>Rarity</label>

                  <div className="rarity_grid">
                    {RARITY_OPTIONS.map(r => {
                      const active = filtersDraft.rarity.includes(r.key);
                    
                      return (
                        <button
                          key={r.key}
                          className={`rarity_btn ${active ? 'active' : ''}`}
                          onClick={() => {
                            setFiltersDraft(f => {
                              const exists = f.rarity.includes(r.key);
                              return {
                                ...f,
                                rarity: exists
                                  ? f.rarity.filter(x => x !== r.key)
                                  : [...f.rarity, r.key]
                              };
                            });
                          }}
                        >
                          <div className="rarity_icon">
                            <RarityIcon type={r.icon} active={active} />
                          </div>
                        
                          <div className="rarity_label">
                            {r.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ROW 3 */}
              <div className="filter_row">
                <div className="filter_field">
                  <label>Set</label>

                  <div className="set_grid">
                    {SET_OPTIONS.map(set => {
                      const active = filtersDraft.set.includes(set.key);
                    
                      return (
                        <button
                          key={set.key}
                          className={`set_btn ${active ? 'active' : ''}`}
                          onClick={() => {
                            setFiltersDraft(f => {
                              const exists = f.set.includes(set.key);
                            
                              return {
                                ...f,
                                set: exists
                                  ? f.set.filter(s => s !== set.key)
                                  : [...f.set, set.key]
                              };
                            });
                          }}
                        >
                          {set.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
                  
              {/* ROW 4 */}
              <div className="filter_row">
                <div className="filter_field">
                  <label>Type</label>
                  <select
                    value={filtersDraft.type}
                    onChange={e =>
                      setFiltersDraft(f => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="">Any</option>
                    {TYPE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                  
                <div className="filter_field">
                  <label>Inkable</label>
                  <select
                    value={filtersDraft.inkable}
                    onChange={e =>
                      setFiltersDraft(f => ({ ...f, inkable: e.target.value }))
                    }
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* ROW 1: COST + STRENGTH */}
              <div className="filter_row compact_pairs">
                                
                <div className="range_group">
                  <label>Cost</label>
                  <div className="range_inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filtersDraft.minCost}
                      onChange={e =>
                        setFiltersDraft(f => ({ ...f, minCost: e.target.value }))
                      }
                    />
                    <span>–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filtersDraft.maxCost}
                      onChange={e =>
                        setFiltersDraft(f => ({ ...f, maxCost: e.target.value }))
                      }
                    />
                  </div>
                </div>
                    
                <div className="range_group">
                  <label>Strength</label>
                  <div className="range_inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filtersDraft.minStrength}
                      onChange={e =>
                        setFiltersDraft(f => ({ ...f, minStrength: e.target.value }))
                      }
                    />
                    <span>–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filtersDraft.maxStrength}
                      onChange={e =>
                        setFiltersDraft(f => ({ ...f, maxStrength: e.target.value }))
                      }
                    />
                  </div>
                </div>
                    
              </div>
                    
              {/* LORE + BODY TEXT */}
              <div className="filter_row compact_pairs">
                    
                <div className="range_group">
                  <label>Lore</label>
                  <div className="range_inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filtersDraft.minLore}
                      onChange={e =>
                        setFiltersDraft(f => ({ ...f, minLore: e.target.value }))
                      }
                    />
                    <span>–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filtersDraft.maxLore}
                      onChange={e =>
                        setFiltersDraft(f => ({ ...f, maxLore: e.target.value }))
                      }
                    />
                  </div>
                </div>
                    
                <div className="range_group">
                </div>
                    
              </div>

              
              {/* ROW 4 */}
              <div className="filter_row">
                <div className="filter_field">

                  <div className="body_text_header">
                    <label>Body Text</label>

                    <label className="regex_checkbox">
                      <input
                        type="checkbox"
                        checked={!!filtersDraft.useRegex}
                        onChange={e =>
                          setFiltersDraft(f => ({
                            ...f,
                            useRegex: e.target.checked
                          }))
                        }
                      />
                      <span className={filtersDraft.useRegex ? 'on' : 'off'}>
                        Use Regex
                      </span>
                    </label>
                  </div>
                      
                  <input
                    type="text"
                    placeholder="Search text..."
                    value={filtersDraft.bodyText || ''}
                    onChange={e =>
                      setFiltersDraft(f => ({
                        ...f,
                        bodyText: e.target.value
                      }))
                    }
                  />

                </div>
              </div>
                  
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