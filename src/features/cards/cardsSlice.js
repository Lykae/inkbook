import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { initDB } from '../../db/initDB';

// -------------------------
// FETCH FROM LORCANA API
// -------------------------
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async ({ name, cost, color, inkable, page = 1, pageSize = 100 }) => {
    const params = new URLSearchParams();

    const searchParts = [];

    // NAME (Lorcana supports fuzzy name search like Name~Elsa)
    if (name && name.trim()) {
      searchParts.push(`Name~${name.trim()}`);
    }

    // COST (example: Cost~3, Cost<3, Cost>3)
    if (cost !== undefined && cost !== null && cost !== '') {
      searchParts.push(`Cost~${cost}`);
    }

    // COLOR (Amber, Steel, etc.)
    if (color) {
      searchParts.push(`Color~${color}`);
    }

    // Inkable filter (API usually expects 1/0 or true/false depending on backend)
    if (inkable !== undefined && inkable !== null) {
      searchParts.push(`Inkable~${inkable ? 1 : 0}`);
    }

    if (searchParts.length > 0) {
      params.append('search', searchParts.join(' '));
    }

    params.append('page', page);
    params.append('pagesize', pageSize);

    const url = `https://api.lorcana-api.com/cards/fetch?${params.toString()}`;

    console.log('URL', url);

    const res = await axios.get(url);

    // API sometimes returns:
    // - array directly
    // - or { data: [...] }
    const data = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];

    return data;
  }
);

// -------------------------
// SAVE CARDS TO DB (optional cache layer)
// -------------------------
export const saveCardsToDB = createAsyncThunk(
  'cards/saveCardsToDB',
  async (cards) => {
    const db = await initDB();

    for (const card of cards) {
      await db.run(
        `INSERT OR REPLACE INTO cards (
          name, cost, type, color, inkable,
          body_text, flavor_text, artist, rarity, image,
          set_name, set_id, set_num,
          date_added, date_modified,
          classifications, strength, willpower, lore
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          card.Name,
          card.Cost,
          card.Type,
          card.Color,
          card.Inkable ? 1 : 0,
          card.Body_Text,
          card.Flavor_Text,
          card.Artist,
          card.Rarity,
          card.Image,
          card.Set_Name,
          card.Set_ID,
          card.Set_Num,
          card.Date_Added,
          card.Date_Modified,
          card.Classifications,
          card.Strength,
          card.Willpower,
          card.Lore
        ]
      );
    }

    return cards;
  }
);

const cardsSlice = createSlice({
  name: 'cards',
  initialState: {
    foundCards: [],
    selectedCard: null,
    loading: false
  },
  reducers: {
    selectCard(state, action) {
      state.selectedCard = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.foundCards = action.payload;
      })
      .addCase(fetchCards.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { selectCard } = cardsSlice.actions;
export default cardsSlice.reducer;