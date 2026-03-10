import { useSearch } from '@tanstack/react-router';
import { useSearchMoviesQuery, useDiscoverMoviesQuery } from '@entities/movie';

/**
 * Orchestrator hook that bridges text search and discover endpoints.
 * - When a text query `q` is present → route to /search/movie
 * - When empty → route to /discover/movie with filters, sort, page
 *
 * Both hooks are called unconditionally (Rules of Hooks compliant).
 * The `skip` option controls which one actually fires a request.
 */
export function useMovieSearch() {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const q = (search.q as string) ?? '';
  const genres = (search.genres as string) ?? undefined;
  const year = (search.year as string) ?? undefined;
  const rating = search.rating !== undefined ? Number(search.rating) : undefined;
  const sort = (search.sort as string) ?? undefined;
  const page = search.page !== undefined ? Number(search.page) : 1;

  const isTextSearch = q.trim().length > 0;

  // Both hooks called unconditionally — Rules of Hooks compliant
  const searchResult = useSearchMoviesQuery({ query: q, page }, { skip: !isTextSearch });
  const discoverResult = useDiscoverMoviesQuery(
    {
      page,
      sort_by: sort,
      with_genres: genres,
      primary_release_year: year,
      'vote_average.gte': rating,
    },
    { skip: isTextSearch },
  );

  // Return the active result; the skipped query will have { data: undefined, isFetching: false }
  return {
    ...(isTextSearch ? searchResult : discoverResult),
    isTextSearch,
  };
}
