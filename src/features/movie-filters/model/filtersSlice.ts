import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface MovieFiltersState {
  genres: string | undefined;
  year: string | undefined;
  rating: number | undefined;
}

const initialState: MovieFiltersState = {
  genres: undefined,
  year: undefined,
  rating: undefined,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setGenres(state, action: PayloadAction<string | undefined>) {
      state.genres = action.payload;
    },
    setYear(state, action: PayloadAction<string | undefined>) {
      state.year = action.payload;
    },
    setRating(state, action: PayloadAction<number | undefined>) {
      state.rating = action.payload;
    },
    setAllFilters(state, action: PayloadAction<Partial<MovieFiltersState>>) {
      state.genres = action.payload.genres ?? state.genres;
      state.year = action.payload.year ?? state.year;
      state.rating = action.payload.rating ?? state.rating;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setGenres, setYear, setRating, setAllFilters, resetFilters } = filtersSlice.actions;

export const selectFilters = (state: { filters: MovieFiltersState }) => state.filters;

export default filtersSlice.reducer;
