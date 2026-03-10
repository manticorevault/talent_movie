export {
  favoritesSlice,
  toggleFavorite,
  removeFavorite,
  selectFavorites,
  selectIsFavorite,
  selectFavoritesArray,
  favoritesMiddleware,
} from './model/favoritesSlice';
export type { FavoritesState } from './model/favoritesSlice';
export { FavoriteToggle } from './ui/FavoriteToggle';
