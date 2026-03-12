import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMovieDetailQuery } from '@entities/movie';
import {
  MovieDetailPanel,
  MovieDetailPanelSkeleton,
  MovieDetailPanelError,
} from '@widgets/movie-detail-panel';
import { Button } from '@shared/ui/button';
import { ArrowLeft } from 'lucide-react';

export function MovieDetailPage() {
  const { movieId } = useParams({ strict: false });
  const navigate = useNavigate();
  // Ensure movieId comes from the route parameters, cast to number as TMDB expects.
  const numericId = Number(movieId);

  const {
    data: movie,
    isLoading,
    isError,
    refetch,
  } = useGetMovieDetailQuery(numericId, {
    skip: isNaN(numericId),
  });

  return (
    <div className="container mx-auto py-8">
      {/* Back navigation */}
      <Button
        data-testid="back-button"
        variant="ghost"
        className="mb-8 gap-2 pl-0 hover:bg-transparent hover:underline"
        onClick={() => navigate({ to: '/movies' })}
        aria-label="Back to movies"
      >
        <ArrowLeft size={16} />
        Back to movies
      </Button>

      {/* Main content area */}
      {isLoading || isNaN(numericId) ? (
        <MovieDetailPanelSkeleton />
      ) : isError || !movie ? (
        <MovieDetailPanelError onRetry={refetch} />
      ) : (
        <MovieDetailPanel movie={movie} />
      )}
    </div>
  );
}
