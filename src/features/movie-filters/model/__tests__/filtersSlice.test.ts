import { describe, it, expect } from 'vitest';
import filtersReducer, {
  setGenres,
  setYear,
  setRating,
  setAllFilters,
  resetFilters,
  type MovieFiltersState,
} from '../filtersSlice';

const initialState: MovieFiltersState = {
  genres: undefined,
  year: undefined,
  rating: undefined,
};

describe('filtersSlice', () => {
  it('should return the initial state', () => {
    expect(filtersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setGenres', () => {
    const state = filtersReducer(initialState, setGenres('28,12'));
    expect(state.genres).toBe('28,12');
  });

  it('should handle setYear', () => {
    const state = filtersReducer(initialState, setYear('2024'));
    expect(state.year).toBe('2024');
  });

  it('should handle setRating', () => {
    const state = filtersReducer(initialState, setRating(7.5));
    expect(state.rating).toBe(7.5);
  });

  it('should handle setAllFilters', () => {
    const state = filtersReducer(
      initialState,
      setAllFilters({
        genres: '28',
        year: '2023',
        rating: 6,
      }),
    );
    expect(state).toEqual({ genres: '28', year: '2023', rating: 6 });
  });

  it('should handle resetFilters', () => {
    const populated: MovieFiltersState = { genres: '28', year: '2023', rating: 5 };
    const state = filtersReducer(populated, resetFilters());
    expect(state).toEqual(initialState);
  });

  it('should handle clearing individual filters with undefined', () => {
    const populated: MovieFiltersState = { genres: '28', year: '2023', rating: 5 };
    const state = filtersReducer(populated, setGenres(undefined));
    expect(state.genres).toBeUndefined();
    expect(state.year).toBe('2023');
  });
});
