import React from 'react';
import { Link } from 'react-router-dom';

export default function Intro() {
  return (
    <div className="intro">
      <div className="intro_content">

        <Link to="/">
          <img
            src="/img/Logo.png"
            alt="Inkbook"
          />
        </Link>
        <div className="logo_text">INKBOOK</div>

        <br />

        <Link to="/decks/new">
          <button className="intro_build">
            Build a Deck
          </button>
        </Link>

        <Link to="/decks">
          <button className="intro_all">
            View Decks
          </button>
        </Link>

      </div>
    </div>
  );
}