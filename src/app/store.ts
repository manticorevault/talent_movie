import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { movieApi } from '@entities/movie/model/movieApi';
import filtersReducer from '@features/movie-filters/model/filtersSlice';
import sortReducer from '@features/movie-sort/model/sortSlice';
import favoritesReducer, { favoritesMiddleware } from '@features/favorites/model/favoritesSlice';

const rootReducer = combineReducers({
  [movieApi.reducerPath]: movieApi.reducer,
  filters: filtersReducer,
  sort: sortReducer,
  favorites: favoritesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(movieApi.middleware, favoritesMiddleware),
  });
};

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
