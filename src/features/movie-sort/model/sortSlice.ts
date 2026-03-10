import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SortState {
  sortBy: string;
}

const initialState: SortState = {
  sortBy: 'popularity.desc',
};

export const sortSlice = createSlice({
  name: 'sort',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    resetSort() {
      return initialState;
    },
  },
});

export const { setSortBy, resetSort } = sortSlice.actions;

export const selectSortBy = (state: { sort: SortState }) => state.sort.sortBy;

export default sortSlice.reducer;
