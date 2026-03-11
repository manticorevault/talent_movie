import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '@app/store';
import type { Movie } from '@entities/movie';

// --- Router mock ---
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({}),
  useNavigate: () => vi.fn(),
  Link: ({ children, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={props.to}>{children}</a>
  ),
}));

// Mock TanStack Virtual — jsdom has no scroll layout
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

import { FavoritesList } from '../ui/FavoritesList';

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
];

function buildFavoritesState(movies: Movie[]) {
  const items: Record<number, Movie> = {};
  for (const m of movies) {
    items[m.id] = m;
  }
  return { favorites: { items } };
}

function renderFavoritesList(preloadedState = {}) {
  const store = setupStore(preloadedState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <FavoritesList />
      </Provider>,
    ),
  };
}

describe('FavoritesList', () => {
  it('displays empty state when there are no favorites', () => {
    renderFavoritesList();

    expect(screen.getByTestId('favorites-empty')).toBeInTheDocument();
    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    expect(screen.getByText('Browse Movies')).toBeInTheDocument();
  });

  it('renders favorite movies as table rows', () => {
    renderFavoritesList(buildFavoritesState(mockMovies));

    const rows = screen.getAllByTestId('movie-row');
    expect(rows.length).toBe(mockMovies.length);
  });

  it('renders correct movie titles in the table', () => {
    renderFavoritesList(buildFavoritesState(mockMovies));

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
  });

  it('renders FavoriteToggle buttons for each movie', () => {
    renderFavoritesList(buildFavoritesState(mockMovies));

    for (const movie of mockMovies) {
      expect(screen.getByTestId(`favorite-toggle-${movie.id}`)).toBeInTheDocument();
    }
  });

  it('removes a movie from favorites when toggle is clicked', () => {
    const { store } = renderFavoritesList(buildFavoritesState(mockMovies));

    const favButton = screen.getByTestId(`favorite-toggle-${mockMovies[0].id}`);
    fireEvent.click(favButton);

    expect(store.getState().favorites.items[mockMovies[0].id]).toBeUndefined();
  });

  it('shows empty state after removing the last favorite', () => {
    const singleFav = buildFavoritesState([mockMovies[0]]);
    renderFavoritesList(singleFav);

    const favButton = screen.getByTestId(`favorite-toggle-${mockMovies[0].id}`);
    fireEvent.click(favButton);

    expect(screen.getByTestId('favorites-empty')).toBeInTheDocument();
  });

  it('has correct ARIA attributes on the table container', () => {
    renderFavoritesList(buildFavoritesState(mockMovies));

    const container = screen.getByRole('grid');
    expect(container).toHaveAttribute('aria-label', 'Favorites');
    expect(container).toHaveAttribute('aria-rowcount', String(mockMovies.length));
  });

  it('displays movie metadata columns correctly', () => {
    renderFavoritesList(buildFavoritesState([mockMovies[0]]));

    expect(screen.getByText('2010-07-16')).toBeInTheDocument();
    expect(screen.getByText('8.8')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });
});
