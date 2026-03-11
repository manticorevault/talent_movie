import { type Page, type Locator } from '@playwright/test';

export class FavoritesPage {
  readonly emptyState: Locator;
  readonly tableRows: Locator;
  readonly moviesLink: Locator;

  constructor(public readonly page: Page) {
    this.emptyState = page.getByTestId('favorites-empty');
    this.tableRows = page.getByTestId('movie-row');
    this.moviesLink = page.getByRole('link', { name: 'Browse Movies', exact: true });
  }

  async goto() {
    await this.page.goto('/favorites');
  }
}
