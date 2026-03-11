import { type Page, type Locator } from '@playwright/test';

export class MoviesPage {
  readonly searchInput: Locator;
  readonly filtersToggle: Locator;
  readonly tableRows: Locator;
  readonly skeletonRows: Locator;
  readonly paginationNext: Locator;
  readonly paginationPrev: Locator;

  constructor(public readonly page: Page) {
    this.searchInput = page.getByTestId('search-input');
    this.filtersToggle = page.getByTestId('filters-toggle');
    this.tableRows = page.getByTestId('movie-row');
    this.skeletonRows = page.getByTestId('skeleton-row');
    this.paginationNext = page.getByTestId('pagination-next');
    this.paginationPrev = page.getByTestId('pagination-prev');
  }

  async goto() {
    await this.page.goto('/movies');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(350); // wait for 300ms debounce
  }

  async clickRow(index: number) {
    await this.tableRows.nth(index).click();
  }

  async clickNextPage() {
    await this.paginationNext.click();
  }

  async clickPrevPage() {
    await this.paginationPrev.click();
  }
}
