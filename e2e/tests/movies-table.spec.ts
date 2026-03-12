import { test, expect } from '../fixtures';
import { MoviesPage } from '../pages/MoviesPage';

test.describe('Movies Table', () => {
  let moviesPage: MoviesPage;

  test.beforeEach(async ({ page }) => {
    moviesPage = new MoviesPage(page);
    await moviesPage.goto();
  });

  test('loads and renders at least 1 row after skeleton disappears', async () => {
    // Wait for skeletons to disappear
    await expect(moviesPage.skeletonRows.first()).toBeVisible();
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });

    // Ensure at least one row is rendered
    await expect(moviesPage.tableRows.first()).toBeVisible();
    const count = await moviesPage.tableRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('searching "Inception" filters rows', async ({ page }) => {
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });
    await moviesPage.tableRows.count();

    await moviesPage.search('Inception');

    // Wait for the table rows to update (might take a moment)
    await page.waitForResponse(
      (response) => response.url().includes('/search/movie') && response.status() === 200,
    );

    // We expect the row count to likely be different or at least the first row matches our query
    await expect(moviesPage.tableRows.first()).toBeVisible();
    await expect(moviesPage.tableRows.first()).toContainText('Inception');
  });

  test('clicking the genre filter updates active badge count', async ({ page }) => {
    await moviesPage.filtersToggle.click();

    // Find the genre popover trigger button
    const genreTrigger = page.getByRole('button', { name: /Select genres/i });
    await genreTrigger.click();

    // Select a genre, e.g., Action
    const actionOption = page.getByRole('option', { name: 'Action' });
    await actionOption.click();

    // Check filter badge count
    const badgeCount = page.getByTestId('filter-badge-count');
    await expect(badgeCount).toBeVisible();
    await expect(badgeCount).toHaveText('1');
  });

  test('clicking a column sort header changes the sort icon', async ({ page }) => {
    // Release Date sort button
    const releaseDateHeader = page.getByTestId('sort-header-release_date');
    await releaseDateHeader.click();

    // Check if it toggled to desc (or asc based on current state)
    // Wait for the network request and react transition
    await expect(releaseDateHeader).toHaveAttribute('aria-sort', /ascending|descending/);
    await expect(page).toHaveURL(/sort=release_date/);
  });

  test('clicking next page increments the page number in the URL', async ({ page }) => {
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });
    await moviesPage.clickNextPage();
    await expect(page).toHaveURL(/page=2/);
  });

  test('clicking a row navigates to /movies/:id', async ({ page }) => {
    await expect(moviesPage.skeletonRows).toHaveCount(0, { timeout: 10000 });
    await moviesPage.tableRows.first().click();
    await expect(page).toHaveURL(/\/movies\/\d+/);
  });
});
