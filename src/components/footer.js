import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="footer_content">
        Created by{' '}
        <a href="http://vegemouse.github.io/portfolio-2" target="_blank" rel="noreferrer">
          Maxwell Cady
        </a>

        <br /><br />

        Card Images by{' '}
        <a
          href="http://gatherer.wizards.com/Pages/Default.aspx"
          target="_blank"
          rel="noreferrer"
        >
          Wizards Gatherer
        </a>

        <br /><br />

        <a
          href="https://github.com/vegemouse/spellbook"
          target="_blank"
          rel="noreferrer"
        >
          <i className="fa fa-github" aria-hidden="true"></i>
        </a>
      </div>
    </footer>
  );
}