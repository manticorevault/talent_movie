import { test, expect } from '../fixtures';
import { MoviesPage } from '../pages/MoviesPage';
import { FavoritesPage } from '../pages/FavoritesPage';

test.describe('Favorites', () => {
  let favoritesPage: FavoritesPage;
  let moviesPage: MoviesPage;

  test.beforeEach(async ({ page }) => {
    favoritesPage = new FavoritesPage(page);
    moviesPage = new MoviesPage(page);

    // Ensure clean state before each test
    await page.addInitScript(() => {
      window.localStorage.removeItem('movieFavorites');
    });
  });

  test('navigating to /favorites when empty shows empty state', async () => {
    await favoritesPage.goto();

    await expect(favoritesPage.emptyState).toBeVisible();
    await expect(favoritesPage.moviesLink).toBeVisible();
  });

  test('adding a movie from the table and visiting /favorites shows that movie', async () => {
    // Go to movies table
    await moviesPage.goto();
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });

    // get title to assert on favorites page
    const movieTitle = await moviesPage.tableRows.first().locator('td').first().innerText();

    // Find the first favorite toggle button and click it to add to favorites
    const firstFaveBtn = moviesPage.tableRows
      .first()
      .getByRole('button', { name: /Add.*to favorites/i });
    await firstFaveBtn.click();

    // Go to favorites page
    await favoritesPage.goto();

    // Check if the movie is present
    await expect(favoritesPage.emptyState).toBeHidden();
    await expect(favoritesPage.tableRows.first()).toBeVisible();
    await expect(favoritesPage.tableRows.first()).toContainText(movieTitle);
  });

  test('removing a favorite from the favorites table removes the row', async () => {
    // Setup: favorite a movie
    await moviesPage.goto();
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });
    const firstFaveBtn = moviesPage.tableRows
      .first()
      .getByRole('button', { name: /Add.*to favorites/i });
    await firstFaveBtn.click();

    // Go to favorites page
    await favoritesPage.goto();
    await expect(favoritesPage.tableRows.first()).toBeVisible();

    // Remove the favorite
    const removeBtn = favoritesPage.tableRows
      .first()
      .getByRole('button', { name: /Remove.*from favorites/i });
    await removeBtn.click();

    // The row should be gone and empty state should show
    await expect(favoritesPage.tableRows).toHaveCount(0);
    await expect(favoritesPage.emptyState).toBeVisible();
  });

  test('favorites persist across a full page reload', async ({ page }) => {
    // Setup: favorite a movie
    await moviesPage.goto();
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });
    const firstFaveBtn = moviesPage.tableRows
      .first()
      .getByRole('button', { name: /Add.*to favorites/i });
    await firstFaveBtn.click();

    // Go to favorites page
    await favoritesPage.goto();
    await expect(favoritesPage.tableRows.first()).toBeVisible();

    // Reload page
    await page.reload();

    // Verify favorite is still there
    await expect(favoritesPage.emptyState).toBeHidden();
    await expect(favoritesPage.tableRows.first()).toBeVisible();
  });
});
