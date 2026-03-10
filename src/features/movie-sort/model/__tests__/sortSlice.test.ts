import { describe, it, expect } from 'vitest';
import sortReducer, { setSortBy, resetSort, type SortState } from '../sortSlice';

const initialState: SortState = {
  sortBy: 'popularity.desc',
};

describe('sortSlice', () => {
  it('should return the initial state with default sort', () => {
    expect(sortReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSortBy', () => {
    const state = sortReducer(initialState, setSortBy('vote_average.desc'));
    expect(state.sortBy).toBe('vote_average.desc');
  });

  it('should handle resetSort', () => {
    const modified: SortState = { sortBy: 'release_date.asc' };
    const state = sortReducer(modified, resetSort());
    expect(state).toEqual(initialState);
  });

  it('should handle ascending sort', () => {
    const state = sortReducer(initialState, setSortBy('popularity.asc'));
    expect(state.sortBy).toBe('popularity.asc');
  });
});
