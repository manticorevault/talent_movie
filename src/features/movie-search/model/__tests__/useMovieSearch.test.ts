import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMovieSearch } from '../useMovieSearch';

// Mock TanStack Router
const mockSearchParams: Record<string, unknown> = {};
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockSearchParams,
}));

// Mock RTK Query hooks
const mockSearchResult = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: undefined,
};
const mockDiscoverResult = {
  data: { results: [], page: 1, total_pages: 1, total_results: 0 },
  isLoading: false,
  isFetching: false,
  error: undefined,
};

vi.mock('@entities/movie', () => ({
  useSearchMoviesQuery: vi.fn(() => mockSearchResult),
  useDiscoverMoviesQuery: vi.fn(() => mockDiscoverResult),
}));

import { useSearchMoviesQuery, useDiscoverMoviesQuery } from '@entities/movie';

describe('useMovieSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset search params
    Object.keys(mockSearchParams).forEach((key) => delete mockSearchParams[key]);
  });

  it('uses discover endpoint when no text query is present', () => {
    const { result } = renderHook(() => useMovieSearch());

    expect(result.current.isTextSearch).toBe(false);
    expect(useDiscoverMoviesQuery).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }), {
      skip: false,
    });
    expect(useSearchMoviesQuery).toHaveBeenCalledWith(expect.objectContaining({ query: '' }), {
      skip: true,
    });
  });

  it('uses search endpoint when q param is set', () => {
    mockSearchParams.q = 'Inception';

    const { result } = renderHook(() => useMovieSearch());

    expect(result.current.isTextSearch).toBe(true);
    expect(useSearchMoviesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'Inception', page: 1 }),
      { skip: false },
    );
    expect(useDiscoverMoviesQuery).toHaveBeenCalledWith(expect.anything(), { skip: true });
  });

  it('treats whitespace-only query as empty (uses discover)', () => {
    mockSearchParams.q = '   ';

    const { result } = renderHook(() => useMovieSearch());

    expect(result.current.isTextSearch).toBe(false);
    expect(useDiscoverMoviesQuery).toHaveBeenCalledWith(expect.anything(), { skip: false });
  });

  it('passes filter params to discover endpoint', () => {
    mockSearchParams.genres = '28,12';
    mockSearchParams.year = '2024';
    mockSearchParams.rating = 7;
    mockSearchParams.sort = 'vote_average.desc';

    renderHook(() => useMovieSearch());

    expect(useDiscoverMoviesQuery).toHaveBeenCalledWith(
      {
        page: 1,
        sort_by: 'vote_average.desc',
        with_genres: '28,12',
        primary_release_year: '2024',
        'vote_average.gte': 7,
      },
      { skip: false },
    );
  });

  it('passes page param correctly', () => {
    mockSearchParams.page = 3;

    renderHook(() => useMovieSearch());

    expect(useDiscoverMoviesQuery).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }), {
      skip: false,
    });
  });
});
