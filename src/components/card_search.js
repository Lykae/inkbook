import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { fetchCards, selectCard } from '../features/cards/cardsSlice';
import { getCardKey } from '../helpers/getCardKey';

export default function CardSearch({
  layout,
  setLayout,
  openViewer,
  getCount,
  onIncrease,
  onDecrease,
  page,
  setPage,
  setImportOpen,
  deckFormat
}) {
  const dispatch = useDispatch();
  const foundCards = useSelector(state => state.cards.foundCards);

  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [useClientPaging, setUseClientPaging] = useState(false);

  const pageSize = 100;
  const [allCardsCache, setAllCardsCache] = useState({
    key: null,
    cards: []
  });

  const [sortDraft, setSortDraft] = useState({
    orderby: '',
    direction: 'asc'
  });

  const [sort, setSort] = useState(sortDraft);

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
    bodyText: '',
    useRegex: false,
    classifications: ''
  });

  const [filters, setFilters] = useState(filtersDraft);

  const [showSort, setShowSort] = useState(false);

  const [term, setTerm] = useState('');

  const buildCacheKey = (term, filters, sortoption) => {
    const safeTerm =
      typeof term === 'string'
        ? term.trim()
        : '';
      
    const f = filters || {};

    return JSON.stringify({
      term: safeTerm,
      color: f.color,
      type: f.type,
      rarity: f.rarity,
      inkable: f.inkable,
      set: f.set,
      minCost: f.minCost,
      maxCost: f.maxCost,
      minStrength: f.minStrength,
      maxStrength: f.maxStrength,
      minLore: f.minLore,
      maxLore: f.maxLore,
      classifications: f.classifications,
      orderby: sortoption.orderby,
      direction: sortoption.direction
    });
  };

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
    'Character',
    'Action',
    'Song',
    'Item',
    'Location'
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

  const isCardLegalForFormat = useCallback((card, format) => {

    const CORE_LEGAL_SETS = [
      'Shimmering Skies',
      'Azurite Sea',
      "Archazia's Island",
      'Reign of Jafar',
      'Fabled',
      'Whispers in the Well',
      'Winterspell',
      'Wilds Unknown',
      'Lorcana Promos'
    ];
  
    const BANNED_CARDS = [
      'Hiram Flaversham - Toymaker',
      'Fortisphere'
    ];

    // banned in every format
    if (BANNED_CARDS.includes(card.Name)) {
      return false;
    }
  
    // infinity = everything else legal
    if (format === 'Infinity') {
      return true;
    }
  
    // core = set 5+
    if (format === 'Core') {
      return CORE_LEGAL_SETS.includes(card.Set_Name);
    }
  
    // default/no limit
    return true;
  }, []);

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

  const prevLoading = useRef(false);

  useEffect(() => {
    if (prevLoading.current && !loading) {
      setSearchSubmitted(true);
    }

    prevLoading.current = loading;
  }, [loading]);

  const applyBodyTextFilter = (cards, bodyText, useRegex) => {
    if (!bodyText?.trim()) return cards;

    try {
    
      if (useRegex) {

        const regex = new RegExp(bodyText, 'i');

        return cards.filter(card => {
          const text = card.Body_Text || '';
          return regex.test(text);
        });

      }

      const parts = bodyText
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);

      if (!parts.length) return cards;

      return cards.filter(card => {

        const text = (card.Body_Text || '').toLowerCase();

        return parts.every(part =>
          text.includes(part.toLowerCase())
        );

      });

    } catch (err) {

      // invalid regex
      return cards;

    }
  };

  //const filteredAllCards = useMemo(() => {
  //  if (!useClientPaging) return foundCards;
//
  //  return applyBodyTextFilter(
  //    allCardsCache.cards,
  //    filters.bodyText,
  //    filters.useRegex
  //  );
  //}, [useClientPaging, allCardsCache.cards, filters.bodyText, filters.useRegex, foundCards]);
//
  //const activeSource = filteredAllCards;

  const source = useMemo(() => {
    const cards = useClientPaging
      ? applyBodyTextFilter(
          allCardsCache.cards,
          filters.bodyText,
          filters.useRegex
        )
      : foundCards;

    return cards.filter(card =>
      isCardLegalForFormat(card, deckFormat)
    );
  }, [
    useClientPaging,
    allCardsCache.cards,
    foundCards,
    filters.bodyText,
    filters.useRegex,
    deckFormat,
    isCardLegalForFormat
  ]);
  const hasNextPage = useMemo(() => {
    return page * pageSize < source.length;
  }, [source, page]);

  const isClientMode =
    useClientPaging &&
    allCardsCache.cards?.length > 0;

  const pagedCards = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return source.slice(start, end);
  }, [source, page]);

  const goToPage = (next) => {
    setPage(next);

    if (isClientMode) {
      loadCardsForSearch(term, filters, next, sortDraft);
    }
  };

  const buildSearchString = (filters = {}) => {
    const {
      color = [],
      rarity = [],
      set = [],
      type = '',
      inkable = '',
      minCost,
      maxCost,
      minStrength,
      maxStrength,
      minLore,
      maxLore,
      classifications = ''
    } = filters;

    const clauses = [];

    if (color.length) {
      if (color.length === 1) {
        clauses.push(`color=${color[0]}`);
      } else {
        clauses.push(`(${color.map(c => `color=${c}`).join(';|')};)`);
      }
    }

    if (type) clauses.push(`type=${type}`);

    if (rarity.length) {
      if (rarity.length === 1) {
        clauses.push(`rarity=${rarity[0]}`);
      } else {
        clauses.push(`(${rarity.map(r => `rarity=${r}`).join(';|')};)`);
      }
    }

    if (inkable !== '') {
      clauses.push(`inkable=${inkable === 'true' ? 1 : 0}`);
    }

    if (minCost) clauses.push(`cost>=${minCost}`);
    if (maxCost) clauses.push(`cost<=${maxCost}`);

    if (minStrength) clauses.push(`strength>=${minStrength}`);
    if (maxStrength) clauses.push(`strength<=${maxStrength}`);

    if (minLore) clauses.push(`lore>=${minLore}`);
    if (maxLore) clauses.push(`lore<=${maxLore}`);

    if (set.length) {
      if (set.length === 1) {
        clauses.push(`set_name~${set[0]}`);
      } else {
        clauses.push(`(${set.map(s => `set_name~${s}`).join(';|')};)`);
      }
    }

    const parsedClassifications = classifications
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (parsedClassifications.length === 1) {
      clauses.push(`classifications~${parsedClassifications[0]}`);
    }

    if (parsedClassifications.length > 1) {
      clauses.push(
        `(${parsedClassifications
          .map(c => `classifications~${c}`)
          .join(';')};)`
      );
    }

    return clauses.join(';');
  };

  const searchRef = useRef(
    _.debounce((term, filters, page = 1, sort) => {
      const search = buildSearchString(filters);
      const finalSearch = [
        term?.trim() ? `name~${term.trim()}` : null,
        search || null
      ]
        .filter(Boolean)
        .join(';');

      console.log('SEARCH STRING:', finalSearch);

      dispatch(fetchCards({
        search: finalSearch || undefined,
        page,
        pageSize: pageSize,
        orderby: sort.orderby,
        sortdirection: sort.direction
      }));
    }, 300)
  );

  //const runSearch = (nextTerm = term, nextFilters = filters, nextPage = page, nextSort = sort) => {
  //  setSearchSubmitted(true);
  //  searchRef.current(nextTerm, nextFilters, nextPage, nextSort);
  //};

  const fetchAllCardsCached = async (term, filters, sortoptions) => {
    const pageSizeMax = 1000;
    let page = 1;
    let all = [];

    while (true) {

      const search = buildSearchString(filters);

      const finalSearch = [
        term?.trim()
          ? `name~${term.trim()}`
          : null,
        search || null
      ]
        .filter(Boolean)
        .join(';');

      const result = await dispatch(fetchCards({
        search: finalSearch || undefined,
        page,
        pageSize: pageSizeMax,
        orderby: sortoptions.orderby,
        sortdirection: sortoptions.direction
      })).unwrap();

      if (!result?.length) break;

      all = all.concat(result);

      if (result.length < pageSizeMax) break;

      page++;
    }

    return all;
  };

  const loadCardsForSearch = async (
    nextTerm = term,
    nextFilters = filters,
    nextPage = 1,
    nextSort = sort
  ) => {

    const cacheKey = buildCacheKey(
      nextTerm,
      nextFilters,
      nextSort
    );

    const hasBodyText =
      nextFilters.bodyText &&
      nextFilters.bodyText.trim() !== '';

    const hasOrder =
      nextSort.orderby &&
      nextSort.orderby.trim() !== '';

    const hasHeavyFilter =
      hasBodyText || hasOrder;

    if (hasHeavyFilter) {

      if (allCardsCache.key !== cacheKey) {

        const cards = await fetchAllCardsCached(
          nextTerm,
          nextFilters,
          nextSort
        );

        setAllCardsCache({
          key: cacheKey,
          cards
        });
      }

      setUseClientPaging(true);

    } else {

      setUseClientPaging(false);

      searchRef.current(
        nextTerm,
        nextFilters,
        nextPage,
        nextSort
      );
    }
    setPage(nextPage);
  };
  

  const handleApply = async () => {
    const nextFilters = filtersDraft;

    setFilters(nextFilters);
    setPage(1);
    setShowAdvanced(false);

    //loadCardsForSearch(term, filters, 1, sortDraft);
    
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
      bodyText: '',
      useRegex: false,
      classifications: ''
    });

    setAllCardsCache({key: '', cards: []})
    setPage(1);
    setUseClientPaging(false);
  };

  useEffect(() => {
    if (showAdvanced) {
      setFiltersDraft(filters);
    }
  }, [showAdvanced, filters]);

  useEffect(() => {
    setPage(1);
  }, [useClientPaging, setPage]);

  //useEffect(() => {
  //  loadCardsForSearch(term, filters, page);
  //}, [page]);
//
  //useEffect(() => {
  //  if (page < 1) setPage(1);
  //}, [page]);

  const renderGrid = () => (
    <div className="card_grid">
      {pagedCards.map((card, i) => (
        <div
          key={getCardKey(card)}
          className="card_grid_item"
          onClick={() => {
            dispatch(selectCard(card));
            openViewer(pagedCards, card);
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
          <button
            className="advanced_btn_search"
            onClick={() => setImportOpen(true)}
          >
            <i className="fa fa-upload" />
          </button>

          <button
            className="advanced_btn_search"
            onClick={() => setShowSort(true)}
          >
            <i className="fa fa-sort" />
          </button>
    
          {/* advanced filters */}
          
          <button
            className="advanced_btn_search"
            onClick={() => setShowAdvanced(true)}
          >
            <i className="fa fa-sliders" />
          </button>
    
        </div>
      </div>
      <div className="search_input_row">
        <input
          placeholder="Elsa"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              loadCardsForSearch(e.target.value, filters, 1, sort);;
            }
          }}
        />

        <button
          className="search_button"
          onClick={() => {
            setPage(1);
            loadCardsForSearch(term, filters, 1, sort);
          }}
        >
          <i className="fa fa-search" />
        </button>
      </div>

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
            {!loading && pagedCards?.length < 1 && searchSubmitted ? (
              <span className="error">No cards found.</span>
            ) : (
              pagedCards?.map((card, i) => (
                <li
                  key={getCardKey(card)}
                  className="deck_row search_row"
                  onClick={() => {
                    dispatch(selectCard(card));
                    if (openViewer) openViewer(pagedCards, card);
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

      {!loading && pagedCards?.length > 0 && (
        <div className="pagination_controls">
          <button
            className="pagination_button"
            disabled={page === 1}
            onClick={() => goToPage(Math.max(1, page - 1))}
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            className="pagination_button"
            disabled={!hasNextPage}
            onClick={() => goToPage(page + 1)}
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
                          src={`/inkbook/img/${color}.png`}
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
                  <div className="filter_field">
                    <label>Classifications</label>
                    <input
                      type="text"
                      placeholder="Storyborn, Hero"
                      value={filtersDraft.classifications || ''}
                      onChange={e =>
                        setFiltersDraft(f => ({
                          ...f,
                          classifications: e.target.value
                        }))
                      }
                    />
                  </div>
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
                    placeholder="Banish;location..."
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

              <div>
                <button className="advanced_cancel_btn"
                        onClick={() => setShowAdvanced(false)}
                >
                  Cancel
                </button>
                            
                <button onClick={handleApply}>
                  Apply
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

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
              <button onClick={() => {
                setSortDraft({ orderby: '', direction: 'asc' });
              }}>
                Reset
              </button>

              <div>
                <button className="advanced_cancel_btn"
                  onClick={() => {
                    setShowSort(false);
                  }}
                >
                  Cancel
                </button>
            
                <button onClick={() => {
                  setSort(sortDraft);
                  setShowSort(false);
                }}>
                  Apply
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
    
  );
}