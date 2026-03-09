import { configureStore, combineReducers } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  dummy: (state = {}) => state,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
