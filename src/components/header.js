import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header({
  onSave,
  canSave = false
}) {
  const location = useLocation();
  const isDeckBuilder = location.pathname === '/decks/new';

  return (
    <header className="app_header">

      {/* LEFT */}
      <div className="header_left">
        <Link to="/decks" className="logo">
          <img src="/img/Logo.png" alt="Inkbook" />
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

      </div>

    </header>
  );
}