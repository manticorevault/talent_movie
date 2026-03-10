import { describe, it, expect, vi, beforeEach } from 'vitest';
import favoritesReducer, {
  toggleFavorite,
  removeFavorite,
  type FavoritesState,
} from '../favoritesSlice';
import type { Movie } from '@entities/movie/model/types';

// Mock localStorage so the initial state loader doesn't fail in test env
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
});

const mockMovie: Movie = {
  id: 123,
  title: 'Test Movie',
  overview: 'A test movie',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2024-01-01',
  vote_average: 8.5,
  vote_count: 1000,
  popularity: 100,
  original_language: 'en',
  genre_ids: [28, 12],
};

const mockMovie2: Movie = {
  ...mockMovie,
  id: 456,
  title: 'Second Movie',
};

const emptyState: FavoritesState = { items: {} };

describe('favoritesSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the initial state', () => {
    const state = favoritesReducer(emptyState, { type: 'unknown' });
    expect(state.items).toEqual({});
  });

  it('should add a movie to favorites via toggleFavorite', () => {
    const state = favoritesReducer(emptyState, toggleFavorite(mockMovie));
    expect(state.items[123]).toEqual(mockMovie);
  });

  it('should remove a movie from favorites when toggling again', () => {
    const withFavorite: FavoritesState = { items: { 123: mockMovie } };
    const state = favoritesReducer(withFavorite, toggleFavorite(mockMovie));
    expect(state.items[123]).toBeUndefined();
  });

  it('should handle multiple favorites', () => {
    let state = favoritesReducer(emptyState, toggleFavorite(mockMovie));
    state = favoritesReducer(state, toggleFavorite(mockMovie2));
    expect(Object.keys(state.items)).toHaveLength(2);
    expect(state.items[123]).toEqual(mockMovie);
    expect(state.items[456]).toEqual(mockMovie2);
  });

  it('should handle removeFavorite', () => {
    const withFavorite: FavoritesState = { items: { 123: mockMovie, 456: mockMovie2 } };
    const state = favoritesReducer(withFavorite, removeFavorite(123));
    expect(state.items[123]).toBeUndefined();
    expect(state.items[456]).toEqual(mockMovie2);
  });
});
