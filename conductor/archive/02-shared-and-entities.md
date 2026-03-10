# Track 2: Shared & Entities Layers

## Objective
Implement zero-dependency shared utilities, set up environment configuration, and create the core data models and API services via RTK Query.

## Tasks
1. **Shared Config & Utils**
   - Create `shared/config/env.ts` with typed Zod validation for environment variables (e.g., `VITE_TMDB_API_KEY`).
   - Create `shared/api/constants.ts` for TMDB base URLs.
   - Create `shared/lib/storage.ts` for robust localStorage wrapping and error handling.

2. **Movie Entity Definition**
   - Define TypeScript types for TMDB responses in `entities/movie/model/types.ts`.
   - Implement `entities/movie/ui/MovieRow.tsx` (base row used by the MovieTable widget).

3. **RTK Query API Configuration**
   - Set up `movieApi` in `entities/movie/model/movieApi.ts`.
   - Implement secure `prepareHeaders` logic for injecting the Bearer token.
   - Add endpoints: `discoverMovies`, `searchMovies`, `getMovieDetail`, `getGenres` with appropriate caching strategy.

4. **Redux Store Setup**
   - Initialize the `AppStore` in `app/providers/StoreProvider.tsx` mapping the `movieApi.reducer`.

## Acceptance Criteria
- [ ] Shared configurations are established and robust.
- [ ] RTK Query automatically fetches initial movie data or handles API faults correctly.
- [ ] Tests exist for all shared utilities and types.
