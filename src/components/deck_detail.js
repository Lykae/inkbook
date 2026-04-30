import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CardViewer from './card_view';

import { fetchDeck } from '../features/decks/decksSlice';

import SampleHand from './sample_hand';
import ColorChart from './color_chart';
import CmcChart from './cmc_chart';
import AnimateOnChange from 'react-animate-on-change';

export default function DeckDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const deck = useSelector(state => state.decks.selectedDeck);

  const [activeCard, setActiveCard] = useState({
    image: './../../img/mtg-back.jpg',
    name: 'Select a card'
  });

  useEffect(() => {
    dispatch(fetchDeck(id));
  }, [id, dispatch]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cardList = useMemo(() => {
    return (deck?.cards || []).map((c) => ({
      ...c,
      name: c.name || c.Name,
      cost: c.cost ?? c.Cost,
      set_name: c.set_name || c.Set_Name,
      image: c.image || c.Image
    }));
  }, [deck?.cards]);

  //const handleCardClick = (card) => {
  //  setActiveCard(card);
  //};

  const viewerCards = useMemo(() => {
    const seen = new Set();

    return cardList.filter((card) => {
      const key = `${card.name}-${card.cost}-${card.set_name}`;

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [cardList]);

  const handleCardClick = (card) => {
    const index = viewerCards.findIndex(
      c =>
        c.name === card.name &&
        c.cost === card.cost &&
        c.set_name === card.set_name
    );

    setCurrentIndex(index >= 0 ? index : 0);

    if (window.innerWidth < 768) {
      setViewerOpen(true);
    } else {
      setActiveCard(card);
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setCurrentIndex(0);
  };

  const renderCards = (filterFn = () => true) => {
    const filtered = cardList.filter(filterFn);

    if (!filtered.length) return <span>None</span>;

    const counts = filtered.reduce((acc, card) => {
      const key = `${card.name}-${card.cost}-${card.set_name}`;

      if (!acc[key]) {
        acc[key] = { card, count: 0 };
      }

      acc[key].count++;
      return acc;
    }, {});

    return Object.values(counts).map(({ card, count }) => (
      <span
        key={`${card.name}-${card.cost}-${card.set_name}`}
        onClick={() => handleCardClick(card)}
      >
        {count}x {card.name}
        <br />
      </span>
    ));
  };

  if (!deck) {
    return <h3 className="loading">loading deck...</h3>;
  }

  const creator = deck.creator || 'Anonymous';

  return (
    <div className="container deck_detail">

      <div className="row">
        <h2>{deck.name}</h2>
        <span className="deck_detail_format">
          {deck.format} deck by {creator}
        </span>

        <p className="deck_detail_description">
          {deck.description}
        </p>
      </div>

      <div className="row">

        {/* LEFT COLUMN */}
        <div className="col-sm-4">
          <div className="deck_detail_well">
            <div className="deck_detail_well_header">Cards</div>
            <div className="deck_detail_well_body">
              {renderCards(() => true)}
            </div>
          </div>
        </div>


        {/* MIDDLE */}
        <div className="col-sm-5">

          <div className="deck_detail_active_card">
            <AnimateOnChange
              baseClassName="active-card"
              animationClassName="active-card-animate"
              animate={true}
            >
              <img
                src={activeCard.image}
                alt={activeCard.name}
              />
            </AnimateOnChange>
          </div>

        </div>

        {/* RIGHT */}
        <div className="col-sm-3">
          <div className="deck_detail_colors">
            <div className="deck_detail_colors_header">Colors</div>
            <div className="deck_detail_colors_body">
              <ColorChart deck={deck} />
            </div>
          </div>
          <div className="deck_detail_cmc">
            <div className="deck_detail_cmc_header">
              Cost Curve
            </div>
            <div className="deck_detail_cmc_body">
              <CmcChart deck={deck} />
            </div>
          </div>
          <div className="deck_detail_well">
            <div className="deck_detail_well_header">Maybe</div>
            <div className="deck_detail_well_body">
              <span>Not implemented yet</span>
            </div>
          </div>
        </div>
      </div>

      <Link to={`/proxy/${id}`} className="proxy-button">
        View deck as printable proxies
      </Link>

      <br />

      <SampleHand deck={deck} />

      <CardViewer
        open={viewerOpen}
        cards={viewerCards}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        onClose={handleCloseViewer}
      />

    </div>
  );
}