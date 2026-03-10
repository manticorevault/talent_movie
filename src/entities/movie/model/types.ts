export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids: number[];
}

export interface MovieDetail extends Omit<Movie, 'genre_ids'> {
  runtime: number | null;
  genres: Genre[];
  budget: number;
  revenue: number;
  status: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface DiscoverMoviesParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: string;
  'vote_average.gte'?: number;
}

export interface SearchMoviesParams {
  query: string;
  page?: number;
}
