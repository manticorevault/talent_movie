/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import App from '../App';

const Fallback = () => (
  <div className="flex h-64 items-center justify-center">
    <Loader2 size={48} className="animate-spin text-primary" />
  </div>
);

// Lazy-loaded page components
const MoviesPage = lazy(() => import('@pages/movies').then((m) => ({ default: m.MoviesPage })));
const MovieDetailPage = lazy(() =>
  import('@pages/movie-detail').then((m) => ({ default: m.MovieDetailPage })),
);
const FavoritesPage = lazy(() =>
  import('@pages/favorites').then((m) => ({ default: m.FavoritesPage })),
);

export const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/movies' });
  },
});

const movieSearchSchema = z.object({
  q: z.string().optional().catch(''),
  page: z.number().catch(1).optional(),
  sort: z.string().optional(),
  genres: z.string().optional(),
  year: z.string().optional(),
  rating: z.union([z.number(), z.array(z.number())]).optional(),
});

const moviesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movies',
  validateSearch: (search) => movieSearchSchema.parse(search),
  component: () => (
    <Suspense fallback={<Fallback />}>
      <MoviesPage />
    </Suspense>
  ),
});

const movieDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movies/$movieId',
  component: () => (
    <Suspense fallback={<Fallback />}>
      <MovieDetailPage />
    </Suspense>
  ),
});

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: () => (
    <Suspense fallback={<Fallback />}>
      <FavoritesPage />
    </Suspense>
  ),
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  moviesRoute,
  movieDetailRoute,
  favoritesRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
