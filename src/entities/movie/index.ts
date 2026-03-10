// Public API for the movie entity
export type {
  Movie,
  MovieDetail,
  Genre,
  MoviesResponse,
  GenresResponse,
  DiscoverMoviesParams,
  SearchMoviesParams,
} from './model/types';

export {
  movieApi,
  useDiscoverMoviesQuery,
  useSearchMoviesQuery,
  useGetMovieDetailQuery,
  useGetGenresQuery,
} from './model/movieApi';

export { MovieRow } from './ui/MovieRow';
