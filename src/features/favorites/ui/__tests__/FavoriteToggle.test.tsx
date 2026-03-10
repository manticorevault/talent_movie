import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@shared/lib/test-utils';
import { FavoriteToggle } from '../FavoriteToggle';
import type { Movie } from '@entities/movie';

const mockMovie: Movie = {
  id: 42,
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
};

describe('FavoriteToggle', () => {
  it('renders an icon-only button by default', () => {
    renderWithProviders(<FavoriteToggle movie={mockMovie} />);
    const btn = screen.getByTestId(`favorite-toggle-${mockMovie.id}`);
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveAttribute('aria-label', `Add ${mockMovie.title} to favorites`);
  });

  it('renders a labeled button when showLabel is true', () => {
    renderWithProviders(<FavoriteToggle movie={mockMovie} showLabel />);
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
  });

  it('dispatches toggleFavorite on click and updates aria-pressed', () => {
    const { store } = renderWithProviders(<FavoriteToggle movie={mockMovie} />);
    const btn = screen.getByTestId(`favorite-toggle-${mockMovie.id}`);

    // Initially not a favorite
    expect(btn).toHaveAttribute('aria-pressed', 'false');

    // Click to add
    fireEvent.click(btn);
    expect(store.getState().favorites.items[mockMovie.id]).toEqual(mockMovie);

    // Re-render to check updated state — dispatch happened synchronously so we can check immediately
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAttribute('aria-label', `Remove ${mockMovie.title} from favorites`);
  });

  it('toggles back to unfavorited on second click', () => {
    const { store } = renderWithProviders(<FavoriteToggle movie={mockMovie} />);
    const btn = screen.getByTestId(`favorite-toggle-${mockMovie.id}`);

    fireEvent.click(btn); // add
    fireEvent.click(btn); // remove

    expect(store.getState().favorites.items[mockMovie.id]).toBeUndefined();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('stops event propagation (does not trigger row click)', () => {
    const parentHandler = vi.fn();
    renderWithProviders(
      <div onClick={parentHandler}>
        <FavoriteToggle movie={mockMovie} />
      </div>,
    );
    fireEvent.click(screen.getByTestId(`favorite-toggle-${mockMovie.id}`));
    expect(parentHandler).not.toHaveBeenCalled();
  });
});
