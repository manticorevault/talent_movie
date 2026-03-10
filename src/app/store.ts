import { configureStore } from '@reduxjs/toolkit';
import { movieApi } from '@entities/movie/model/movieApi';

export const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      [movieApi.reducerPath]: movieApi.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(movieApi.middleware),
  });
};

export const store = setupStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = typeof store.dispatch;
