import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@shared/ui/button';
import { Star } from 'lucide-react';
import { toggleFavorite, selectIsFavorite } from '../model/favoritesSlice';
import type { Movie } from '@entities/movie';

interface FavoriteToggleProps {
  movie: Movie;
  /** When true, renders a full button with label (for detail page). Defaults to icon-only. */
  showLabel?: boolean;
}

export const FavoriteToggle = React.memo(({ movie, showLabel = false }: FavoriteToggleProps) => {
  const dispatch = useDispatch();
  const isFavorite = useSelector((state: { favorites: { items: Record<number, Movie> } }) =>
    selectIsFavorite(state, movie.id),
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click navigation
    dispatch(toggleFavorite(movie));
  };

  if (showLabel) {
    return (
      <Button
        data-testid={`favorite-toggle-${movie.id}`}
        variant="outline"
        onClick={handleToggle}
        aria-label={
          isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`
        }
        aria-pressed={isFavorite}
        className="gap-2"
      >
        <Star
          size={18}
          className={isFavorite ? 'text-[#F2AC57] fill-[#F2AC57]' : 'text-muted-foreground'}
        />
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </Button>
    );
  }

  return (
    <Button
      data-testid={`favorite-toggle-${movie.id}`}
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={
        isFavorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`
      }
      aria-pressed={isFavorite}
    >
      <Star
        size={18}
        className={isFavorite ? 'text-[#F2AC57] fill-[#F2AC57]' : 'text-muted-foreground'}
      />
    </Button>
  );
});

FavoriteToggle.displayName = 'FavoriteToggle';
