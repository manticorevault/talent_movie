import { useState } from 'react';
import { Badge } from '@shared/ui/badge';
import { Skeleton } from '@shared/ui/skeleton';
import { Separator } from '@shared/ui/separator';
import { Button } from '@shared/ui/button';
import { CircleAlert, Star } from 'lucide-react';
import { TMDB_IMAGE_BASE_URL } from '@shared/api/constants';
import { FavoriteToggle } from '@features/favorites';
import type { MovieDetail, Movie } from '@entities/movie';

interface MovieDetailPanelProps {
  movie: MovieDetail;
}

/**
 * Two-column layout for a movie detail view.
 * - Left: poster image with skeleton placeholder until loaded
 * - Right: metadata (title, overview, genres, rating, release date, runtime, language)
 */
export function MovieDetailPanel({ movie }: MovieDetailPanelProps) {
  const [isPosterLoaded, setIsPosterLoaded] = useState(false);

  const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null;

  // Derive a Movie-shaped object for the FavoriteToggle which expects Movie type
  const movieForFavorite: Movie = {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    popularity: movie.popularity,
    original_language: movie.original_language,
    genre_ids: movie.genres.map((g) => g.id),
  };

  return (
    <div className="grid gap-8 md:grid-cols-[300px_1fr]">
      {/* Poster column */}
      <div className="relative">
        {posterUrl ? (
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[36px] shadow-lg">
            {!isPosterLoaded && (
              <Skeleton
                data-testid="movie-poster-skeleton"
                className="absolute inset-0 h-full w-full"
              />
            )}
            <img
              data-testid="movie-poster"
              src={posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              onLoad={() => setIsPosterLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-500 ${isPosterLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        ) : (
          <div
            data-testid="movie-poster"
            className="flex aspect-[2/3] w-full items-center justify-center rounded-[36px] bg-muted text-muted-foreground border border-border"
          >
            No poster available
          </div>
        )}
      </div>

      {/* Metadata column */}
      <div className="space-y-6">
        <h1 data-testid="movie-title" className="text-4xl font-bold tracking-tight text-foreground">
          {movie.title}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">{movie.overview}</p>

        <Separator />

        {/* Genres */}
        {movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <Badge key={genre.id} variant="secondary">
                {genre.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Rating</p>
            <p className="flex items-center gap-1 font-semibold">
              <Star size={14} className="text-[#F2AC57] fill-[#F2AC57]" />
              {movie.vote_average.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Release Date</p>
            <p className="font-semibold">{movie.release_date || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Runtime</p>
            <p className="font-semibold">{movie.runtime ? `${movie.runtime} min` : '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Language</p>
            <p className="font-semibold uppercase">{movie.original_language}</p>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <FavoriteToggle movie={movieForFavorite} showLabel />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton matching the two-column layout
// ---------------------------------------------------------------------------

export function MovieDetailPanelSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[300px_1fr]" role="status" aria-label="Loading">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Separator />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
        <Separator />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state for the detail panel
// ---------------------------------------------------------------------------

export function MovieDetailPanelError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-destructive">
      <CircleAlert size={48} />
      <p className="text-lg font-medium">Failed to load movie details</p>
      <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
