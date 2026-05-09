import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({
  onSave,
  canSave = false
}) {
  const location = useLocation();
  const isDeckBuilder = location.pathname === '/decks/new';
  const isDeckDetail =
    location.pathname.startsWith('/decks/') &&
    location.pathname !== '/decks/new';

  const deckId = location.pathname.split('/')[2];

  return (
    <header className="app_header">

      {/* LEFT */}
      <div className="header_left">
        <Link to="/" className="logo">
          <img src="/img/Logo.png" alt="Inkbook" />
          <div className="logo_text_banner">INKBOOK</div>
        </Link>
      </div>

      {/* CENTER NAV */}
      <div className="header_center">

        <Link to="/decks" className="icon_btn" title="View Decks">
          <i className="fa fa-eye" />
        </Link>

        <Link to="/decks/new" className="icon_btn" title="Build Deck">
          <i className="fa fa-plus" />
        </Link>

      </div>

      {/* RIGHT */}
      <div className="header_right">

        {isDeckBuilder && (
          <button
            className="icon_btn save_icon"
            onClick={onSave}
            disabled={!canSave}
            title="Save Deck"
          >
            <i className="fa fa-floppy-o" />
          </button>
        )}
        
        {isDeckDetail && (
          <Link
            to={`/decks/new?edit=${deckId}`}
            className="icon_btn"
            title="Edit Deck"
          >
            <i className="fa fa-pencil" />
          </Link>
        )}

      </div>

    </header>
  );
}