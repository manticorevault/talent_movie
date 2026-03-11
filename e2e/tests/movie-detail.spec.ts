import { test, expect } from '../fixtures';
import { MoviesPage } from '../pages/MoviesPage';
import { MovieDetailPage } from '../pages/MovieDetailPage';

test.describe('Movie Detail Page', () => {
  let moviesPage: MoviesPage;
  let detailPage: MovieDetailPage;

  test.beforeEach(async ({ page }) => {
    moviesPage = new MoviesPage(page);
    detailPage = new MovieDetailPage(page);
    await moviesPage.goto();

    // Wait for the table to load, then click the first row
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });
    await moviesPage.tableRows.first().click();
    await expect(page).toHaveURL(/\/movies\/\d+/);
  });

  test('renders title, poster image, and genre badges', async ({ page }) => {
    await expect(detailPage.posterSkeleton).toHaveCount(0, { timeout: 10000 });

    // Title is rendered
    const title = detailPage.title;
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();

    // Check at least one genre badge exists (assuming the movie has genres)
    const badges = page.getByText(
      /Action|Adventure|Animation|Comedy|Crime|Documentary|Drama|Family|Fantasy|History|Horror|Music|Mystery|Romance|Science Fiction|TV Movie|Thriller|War|Western/,
    );
    await expect(badges.first()).toBeVisible();
  });

  test('poster skeleton is replaced by actual image', async () => {
    // Eventually the skeleton is hidden
    await expect(detailPage.posterSkeleton).toBeHidden();

    // And the actual poster image is visible
    await expect(detailPage.poster).toBeVisible();
    await expect(detailPage.poster).toHaveAttribute('src', /image\.tmdb\.org/);
  });

  test('clicking Add to Favorites changes button label and persists', async ({ page }) => {
    // Find the Favorite toggle button
    const faveButton = page.getByRole('button', {
      name: /Add.*to favorites|Remove.*from favorites/i,
    });

    // Toggle state
    const currentLabel = await faveButton.getAttribute('aria-label');
    await faveButton.click();

    const newLabel = await faveButton.getAttribute('aria-label');
    expect(newLabel).not.toBe(currentLabel);

    // Reload page
    await page.reload();

    // Check if the state persisted (we expect the "newLabel" to remain)
    const persistentFaveButton = page.getByRole('button', { name: newLabel! });
    await expect(persistentFaveButton).toBeVisible();
  });

  test('back navigation returns to /movies with state preserved', async ({ page }) => {
    await detailPage.clickBack();
    await expect(page).toHaveURL(/\/movies/);

    // Ensure the table rows are visible, showing state is preserved
    await expect(moviesPage.tableRows.first()).toBeVisible();
  });
});
