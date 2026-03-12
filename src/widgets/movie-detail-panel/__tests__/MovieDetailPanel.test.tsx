import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '@app/store';
import type { MovieDetail } from '@entities/movie';

// --- Router mock ---
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({}),
  useNavigate: () => vi.fn(),
  Link: ({ children, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={props.to}>{children}</a>
  ),
}));

import {
  MovieDetailPanel,
  MovieDetailPanelSkeleton,
  MovieDetailPanelError,
} from '../ui/MovieDetailPanel';

const mockMovieDetail: MovieDetail = {
  id: 42,
  title: 'Inception',
  overview: 'A mind-bending thriller about dreams within dreams.',
  poster_path: '/inception.jpg',
  backdrop_path: '/inception-bg.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 30000,
  popularity: 120,
  original_language: 'en',
  runtime: 148,
  genres: [
    { id: 28, name: 'Action' },
    { id: 878, name: 'Science Fiction' },
  ],
  budget: 160000000,
  revenue: 830000000,
  status: 'Released',
};

function renderPanel(movie: MovieDetail = mockMovieDetail) {
  const store = setupStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <MovieDetailPanel movie={movie} />
      </Provider>,
    ),
  };
}

describe('MovieDetailPanel', () => {
  it('renders the movie title', () => {
    renderPanel();
    expect(screen.getByTestId('movie-title')).toHaveTextContent('Inception');
  });

  it('renders the movie overview', () => {
    renderPanel();
    expect(screen.getByText(/mind-bending thriller/)).toBeInTheDocument();
  });

  it('renders genre badges', () => {
    renderPanel();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
  });

  it('renders the poster image with correct attributes', () => {
    renderPanel();
    const poster = screen.getByTestId('movie-poster') as HTMLImageElement;
    expect(poster.tagName).toBe('IMG');
    expect(poster.alt).toBe('Inception poster');
    expect(poster).toHaveAttribute('loading', 'lazy');
  });

  it('shows skeleton while poster is loading', () => {
    renderPanel();
    const skeleton = screen.getByTestId('movie-poster-skeleton');
    expect(skeleton).toBeInTheDocument();
    // Before load, the skeleton should be visible (no "hidden" class)
    expect(skeleton.className).not.toContain('hidden');
  });

  it('hides skeleton after poster loads', () => {
    renderPanel();
    const poster = screen.getByTestId('movie-poster') as HTMLImageElement;
    fireEvent.load(poster);

    expect(screen.queryByTestId('movie-poster-skeleton')).not.toBeInTheDocument();
  });

  it('renders metadata fields (rating, release date, runtime, language)', () => {
    renderPanel();
    expect(screen.getByText('8.8')).toBeInTheDocument();
    expect(screen.getByText('2010-07-16')).toBeInTheDocument();
    expect(screen.getByText('148 min')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('renders "—" when runtime is null', () => {
    renderPanel({ ...mockMovieDetail, runtime: null });
    const runtimeElements = screen.getAllByText('—');
    expect(runtimeElements.length).toBeGreaterThan(0);
  });

  it('renders the FavoriteToggle button with label', () => {
    renderPanel();
    const favButton = screen.getByTestId(`favorite-toggle-${mockMovieDetail.id}`);
    expect(favButton).toBeInTheDocument();
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
  });

  it('shows "no poster available" when poster_path is null', () => {
    renderPanel({ ...mockMovieDetail, poster_path: null });
    expect(screen.getByText('No poster available')).toBeInTheDocument();
  });
});

describe('MovieDetailPanelSkeleton', () => {
  it('renders a loading skeleton layout', () => {
    render(<MovieDetailPanelSkeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
  });
});

describe('MovieDetailPanelError', () => {
  it('renders error message and retry button', () => {
    const onRetry = vi.fn();
    render(<MovieDetailPanelError onRetry={onRetry} />);

    expect(screen.getByText('Failed to load movie details')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
