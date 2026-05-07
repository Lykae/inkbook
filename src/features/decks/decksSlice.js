import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { initDB } from '../../db/initDB';
import {saveDB}  from '../../db/saveDB';

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

export const createDeck = createAsyncThunk(
  'decks/createDeck',
  async (deck) => {
    const db = await initDB();

    const data = JSON.stringify(deck);

    await db.run(
      "INSERT INTO decks (name, data) VALUES (:name, :data)",
      {
        ":name": deck.name,
        ":data": data
      }
    );

    const result = await db.exec("SELECT last_insert_rowid() as id");

    console.log("selectresult", result);

    const id = result?.[0]?.values?.[0]?.[0];

    console.log("resultid", id);

    await saveDB(db);

    return {
      ...deck,
      id
    };
  }
);

export const updateDeck = createAsyncThunk(
  'decks/updateDeck',
  async (deck) => {
    const db = await initDB();

    const data = JSON.stringify(deck);

    await db.run(
      'UPDATE decks SET name = ?, data = ? WHERE id = ?',
      [deck.name, data, deck.id]
    );

    await saveDB(db);

    return deck;
  }
);

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

export const deleteDeck = createAsyncThunk(
  'decks/deleteDeck',
  async (id) => {
    const db = await initDB();

    await db.run(
      'DELETE FROM decks WHERE id = ?',
      [id]
    );

    await saveDB(db);

    return id;
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
      })

      // UPDATE
      .addCase(updateDeck.fulfilled, (state, action) => {
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      
        // optional but good:
        if (state.selectedDeck?.id === action.payload.id) {
          state.selectedDeck = action.payload;
        }
      })

      // DELETE
      .addCase(deleteDeck.fulfilled, (state, action) => {
        state.list = state.list.filter(
          deck => deck.id !== action.payload
        );

        if (state.selectedDeck?.id === action.payload) {
          state.selectedDeck = null;
        }
      });
  }
});

export default decksSlice.reducer;