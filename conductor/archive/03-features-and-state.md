# Track 3: Features & Global State

## Objective
Develop isolated, reusable user-facing features (search, filtering, sorting, favorites) ensuring architectural purity within the FSD `features` directory.

## Tasks
1. **Movie Search (`features/movie-search`)**
   - Create `useMovieSearch.ts` hook acting as the sole orchestrator calling `discoverMovies` and `searchMovies` from `entities/movie`.
   - Build `ui/SearchInput.tsx` (debounced search reading directly from the URL query params).

2. **Movie Filters (`features/movie-filters`)**
   - Build `model/filtersSlice.ts` to sync filter states (genres, year, rating).
   - Build `ui/FiltersPanel.tsx` leveraging shadcn/ui components (`Command`, `Select`, `Slider`) populated by `getGenres` from the API.

3. **Sort Preferences (`features/movie-sort`)**
   - Build `model/sortSlice.ts` mapping TanStack Table sorting to TMDB's `sort_by` URL parameter logic.

4. **Favorites System (`features/favorites`)**
   - Create `model/favoritesSlice.ts` mapping states and persisting changes via Redux middleware to `localStorage`.
   - Build `ui/FavoriteToggle.tsx` (shadcn Button with Lucide Star icons) handling interaction and global states.

## Acceptance Criteria
- [ ] Reducers and slices accurately reflect search params and persist locally.
- [ ] The custom search hook gracefully transitions between query shapes based on URL search params.
- [ ] All features are rigorously unit-tested.
