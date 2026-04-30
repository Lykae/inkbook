import { configureStore } from '@reduxjs/toolkit';
import cardsReducer from './features/cards/cardsSlice';
import decksReducer from './features/decks/decksSlice';

export const store = configureStore({
  reducer: {
    cards: cardsReducer,
    decks: decksReducer
  }
});