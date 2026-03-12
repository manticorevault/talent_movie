import { FavoritesList } from '@widgets/favorites-list';

export function FavoritesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <h1 className="text-foreground tracking-tight">Your Favorites</h1>
        <p className="text-xl text-muted-foreground">
          A personal collection of your favorite movies.
        </p>
      </div>
      <FavoritesList />
    </div>
  );
}
