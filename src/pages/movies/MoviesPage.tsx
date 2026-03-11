import { MovieTable } from '@widgets/movie-table';

export function MoviesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Movies</h1>
        <p className="text-xl text-muted-foreground">
          Discover a world of movies tailored to your taste.
        </p>
      </div>
      <MovieTable />
    </div>
  );
}
