import { createSlice, type PayloadAction, type Middleware } from '@reduxjs/toolkit';
import { z } from 'zod';
import { storage } from '@shared/lib/storage';
import type { Movie } from '@entities/movie';

const FAVORITES_STORAGE_KEY = 'talent-movie-favorites';

// --- Zod schema for defensive localStorage deserialization ---
const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  original_language: z.string(),
  genre_ids: z.array(z.number()),
});

const favoritesSchema = z.record(z.coerce.number(), movieSchema);

// --- State ---
export interface FavoritesState {
  items: Record<number, Movie>;
}

function loadInitialState(): FavoritesState {
  const persisted = storage.get(FAVORITES_STORAGE_KEY, favoritesSchema);
  return { items: persisted ?? {} };
}

const initialState: FavoritesState = loadInitialState();

// --- Slice ---
export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<Movie>) {
      const movie = action.payload;
      if (state.items[movie.id]) {
        delete state.items[movie.id];
      } else {
        state.items[movie.id] = movie;
      }
    },
    removeFavorite(state, action: PayloadAction<number>) {
      delete state.items[action.payload];
    },
  },
});

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions;

// --- Selectors ---
export const selectFavorites = (state: { favorites: FavoritesState }) => state.favorites.items;

export const selectIsFavorite = (state: { favorites: FavoritesState }, movieId: number) =>
  Boolean(state.favorites.items[movieId]);

export const selectFavoritesArray = (state: { favorites: FavoritesState }) =>
  Object.values(state.favorites.items);

// --- Middleware for localStorage persistence ---
export const favoritesMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof (action as { type: string }).type === 'string' &&
    (action as { type: string }).type.startsWith('favorites/')
  ) {
    const state = store.getState() as { favorites: FavoritesState };
    storage.set(FAVORITES_STORAGE_KEY, state.favorites.items);
  }

  return result;
};

export default favoritesSlice.reducer;
