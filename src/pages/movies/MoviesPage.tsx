import { MovieTable } from '@widgets/movie-table';

export function MoviesPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-10 text-center md:text-left space-y-3">
        <h1 className="text-foreground tracking-tight">
          Explorar <span className="text-[#148FF6] tracking-tight">Filmes</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Descubra a nossa base de dados de filmes com filtros dinâmicos e ordenação.
        </p>
      </div>
      <MovieTable />
    </div>
  );
}
