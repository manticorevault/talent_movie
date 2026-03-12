import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '@shared/config/env';
import { TMDB_BASE_URL } from '@shared/api/constants';
import type {
  MoviesResponse,
  DiscoverMoviesParams,
  SearchMoviesParams,
  MovieDetail,
  GenresResponse,
} from './types';

export const movieApi = createApi({
  reducerPath: 'movieApi',
  baseQuery: fetchBaseQuery({
    baseUrl: TMDB_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${env.VITE_TMDB_API_KEY}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Movies', 'SearchResults', 'MovieDetail', 'Genres'],
  endpoints: (builder) => ({
    discoverMovies: builder.query<MoviesResponse, DiscoverMoviesParams>({
      query: (params) => ({
        url: '/discover/movie',
        params,
      }),
      providesTags: ['Movies'],
      keepUnusedDataFor: 300,
    }),
    searchMovies: builder.query<MoviesResponse, SearchMoviesParams>({
      query: (params) => ({
        url: '/search/movie',
        params,
      }),
      providesTags: ['SearchResults'],
      keepUnusedDataFor: 300,
    }),
    getMovieDetail: builder.query<MovieDetail, number>({
      query: (id) => `/movie/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MovieDetail', id }],
      keepUnusedDataFor: 600,
    }),
    getGenres: builder.query<GenresResponse, void>({
      query: () => '/genre/movie/list',
      providesTags: ['Genres'],
      keepUnusedDataFor: 600,
    }),
  }),
  refetchOnMountOrArgChange: 60,
});

export const {
  useDiscoverMoviesQuery,
  useSearchMoviesQuery,
  useGetMovieDetailQuery,
  useGetGenresQuery,
} = movieApi;
