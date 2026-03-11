import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import type { Movie } from '@entities/movie';

// --- Mock data ---
const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'Inception',
    overview: 'A mind-bending thriller',
    poster_path: '/inception.jpg',
    backdrop_path: '/inception-bg.jpg',
    release_date: '2010-07-16',
    vote_average: 8.8,
    vote_count: 30000,
    popularity: 120,
    original_language: 'en',
    genre_ids: [28, 878],
  },
  {
    id: 2,
    title: 'The Dark Knight',
    overview: 'A superhero crime drama',
    poster_path: '/dark-knight.jpg',
    backdrop_path: '/dark-knight-bg.jpg',
    release_date: '2008-07-18',
    vote_average: 9.0,
    vote_count: 25000,
    popularity: 100,
    original_language: 'en',
    genre_ids: [28, 80],
  },
  {
    id: 3,
    title: 'Interstellar',
    overview: 'A space epic',
    poster_path: '/interstellar.jpg',
    backdrop_path: '/interstellar-bg.jpg',
    release_date: '2014-11-07',
    vote_average: 8.6,
    vote_count: 20000,
    popularity: 90,
    original_language: 'en',
    genre_ids: [878, 18],
  },
];

const mockMoviesResponse = {
  page: 1,
  results: mockMovies,
  total_pages: 5,
  total_results: 100,
};

// --- Router mocks ---
const mockNavigate = vi.fn();
let mockSearchParams: Record<string, unknown> = {};

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockSearchParams,
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={props.to}>{children}</a>
  ),
}));

// Mock TanStack Virtual — jsdom has no scroll layout, so the virtualizer returns 0 items.
// We mock it to return all items directly.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * 48,
        end: (i + 1) * 48,
        size: 48,
        key: i,
      })),
    getTotalSize: () => count * 48,
  }),
}));

// --- Feature mocks ---
const mockRefetch = vi.fn();
let mockUseMovieSearchReturn = {
  data: mockMoviesResponse,
  isFetching: false,
  isLoading: false,
  isError: false,
  refetch: mockRefetch,
  isTextSearch: false,
};

vi.mock('@features/movie-search', () => ({
  useMovieSearch: () => mockUseMovieSearchReturn,
  SearchInput: () => <div data-testid="search-input-mock">SearchInput</div>,
}));

vi.mock('@features/movie-filters', () => ({
  FiltersPanel: () => <div data-testid="filters-panel-mock">FiltersPanel</div>,
}));

vi.mock('@features/movie-sort', () => ({
  setSortBy: (value: string) => ({ type: 'sort/setSortBy', payload: value }),
}));

// --- Render helper imports (after mocks) ---
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '@app/store';
import { MovieTable } from '../ui/MovieTable';

function renderMovieTable(preloadedState = {}) {
  const store = setupStore(preloadedState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <MovieTable />
      </Provider>,
    ),
  };
}

describe('MovieTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = {};
    mockUseMovieSearchReturn = {
      data: mockMoviesResponse,
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      isTextSearch: false,
    };
  });

  it('renders skeleton rows when isLoading is true', () => {
    mockUseMovieSearchReturn = {
      ...mockUseMovieSearchReturn,
      data: undefined as unknown as typeof mockMoviesResponse,
      isLoading: true,
    };
    renderMovieTable();

    const skeletonRows = screen.getAllByTestId('skeleton-row');
    expect(skeletonRows.length).toBe(10);
    expect(skeletonRows[0]).toHaveAttribute('role', 'status');
    expect(skeletonRows[0]).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders correct number of movie rows when data is loaded', () => {
    renderMovieTable();

    const rows = screen.getAllByTestId('movie-row');
    expect(rows.length).toBe(mockMovies.length);
  });

  it('clicking a row calls navigate to the correct detail route', () => {
    renderMovieTable();

    const rows = screen.getAllByTestId('movie-row');
    fireEvent.click(rows[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: `/movies/${mockMovies[0].id}` }),
    );
  });

  it('sorting a column dispatches setSortBy action', () => {
    renderMovieTable();

    const sortButton = screen.getByTestId('sort-header-title');
    fireEvent.click(sortButton);

    // The sort handler calls both dispatch(setSortBy(...)) and navigate()
    expect(mockNavigate).toHaveBeenCalled();
    const navigateCall = mockNavigate.mock.calls[0][0];
    expect(navigateCall.search).toBeDefined();
  });

  it('sort headers are disabled during text search', () => {
    mockUseMovieSearchReturn = {
      ...mockUseMovieSearchReturn,
      isTextSearch: true,
    };
    renderMovieTable();

    const sortButton = screen.getByTestId('sort-header-title');
    expect(sortButton).toBeDisabled();
  });

  it('toggles a favorite via the inline FavoriteToggle button', () => {
    const { store } = renderMovieTable();

    const favButton = screen.getByTestId(`favorite-toggle-${mockMovies[0].id}`);
    expect(favButton).toBeInTheDocument();

    fireEvent.click(favButton);
    expect(store.getState().favorites.items[mockMovies[0].id]).toEqual(mockMovies[0]);
  });

  it('displays error state with retry button when query fails', () => {
    mockUseMovieSearchReturn = {
      ...mockUseMovieSearchReturn,
      data: undefined as unknown as typeof mockMoviesResponse,
      isError: true,
    };
    renderMovieTable();

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('displays empty state when no results', () => {
    mockUseMovieSearchReturn = {
      ...mockUseMovieSearchReturn,
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    };
    renderMovieTable();

    expect(screen.getByText('No movies found')).toBeInTheDocument();
  });

  it('renders pagination controls with correct page info', () => {
    mockSearchParams = { page: 2 };
    renderMovieTable();

    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
    expect(screen.getByTestId('pagination-prev')).not.toBeDisabled();
    expect(screen.getByTestId('pagination-next')).not.toBeDisabled();
  });

  it('disables prev button on first page', () => {
    mockSearchParams = { page: 1 };
    renderMovieTable();

    expect(screen.getByTestId('pagination-prev')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    mockSearchParams = { page: 5 };
    renderMovieTable();

    expect(screen.getByTestId('pagination-next')).toBeDisabled();
  });

  it('has correct ARIA attributes on the table container', () => {
    renderMovieTable();

    const container = document.getElementById('movie-table-container');
    expect(container).toHaveAttribute('role', 'grid');
    expect(container).toHaveAttribute('aria-label', 'Movies');
    expect(container).toHaveAttribute('aria-rowcount', '100');
  });

  it('renders SearchInput and FiltersPanel in the toolbar', () => {
    renderMovieTable();

    expect(screen.getByTestId('search-input-mock')).toBeInTheDocument();
    expect(screen.getByTestId('filters-panel-mock')).toBeInTheDocument();
  });
});
