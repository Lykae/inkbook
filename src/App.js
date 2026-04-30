import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AppLayout from './AppLayout';
import DeckList from './components/deck_list';
import NewDeck from './components/deck_new';
import DeckDetail from './components/deck_detail';
import ProxyPage from './components/proxy_page';
import Intro from './components/intro';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Layout wrapper */}
        <Route path="/" element={<AppLayout />}>
          
          {/* IndexRoute replacement */}
          <Route index element={<Intro />} />

          <Route path="decks" element={<DeckList />} />
          <Route path="decks/new" element={<NewDeck />} />
          <Route path="decks/:id" element={<DeckDetail />} />
          <Route path="proxy/:id" element={<ProxyPage />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}