import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { initDB } from '../../db/initDB';
import {saveDB}  from '../../db/saveDB';

// -------------------------
// FETCH ALL DECKS
// -------------------------
export const fetchDecks = createAsyncThunk(
  'decks/fetchDecks',
  async () => {
    const db = await initDB();

    const result = db.exec('SELECT * FROM decks');

    if (!result.length) return [];

    const { columns, values } = result[0];

    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });

      // 👇 IMPORTANT: parse stored deck JSON
      if (obj.data) {
        try {
          const parsed = JSON.parse(obj.data);
          return {
            id: obj.id,
            name: obj.name,
            ...parsed
          };
        } catch (e) {
          console.warn("Invalid deck JSON:", obj.data);
        }
      }

      return obj;
    });
  }
);

// -------------------------
// CREATE DECK
// -------------------------
export const createDeck = createAsyncThunk(
  'decks/createDeck',
  async (deck) => {
    const db = await initDB();

    const data = JSON.stringify(deck);

    db.run(
      'INSERT INTO decks (name, data) VALUES (?, ?)',
      [deck.name, data]
    );

    saveDB(db);

    return {
      id: Date.now(),
      ...deck
    };
  }
);

// -------------------------
// FETCH SINGLE DECK
// -------------------------
export const fetchDeck = createAsyncThunk(
  'decks/fetchDeck',
  async (id) => {
    const db = await initDB();

    const result = db.exec(
      'SELECT * FROM decks WHERE id = ?',
      [id]
    );

    if (!result.length) return null;

    const { columns, values } = result[0];

    const row = values[0];

    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });

    // 👇 parse JSON back into usable deck object
    if (obj.data) {
      const parsed = JSON.parse(obj.data);
      return {
        id: obj.id,
        ...parsed
      };
    }

    return obj;
  }
);

const decksSlice = createSlice({
  name: 'decks',
  initialState: {
    list: [],
    selectedDeck: null,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // LIST
      .addCase(fetchDecks.fulfilled, (state, action) => {
        state.list = action.payload;
      })

      // CREATE
      .addCase(createDeck.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // SINGLE DECK
      .addCase(fetchDeck.fulfilled, (state, action) => {
        state.selectedDeck = action.payload;
      });
  }
});

export default decksSlice.reducer;