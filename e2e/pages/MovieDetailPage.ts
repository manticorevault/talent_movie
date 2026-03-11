import { type Page, type Locator } from '@playwright/test';

export class MovieDetailPage {
  readonly backButton: Locator;
  readonly title: Locator;
  readonly poster: Locator;
  readonly posterSkeleton: Locator;

  constructor(public readonly page: Page) {
    this.backButton = page.getByTestId('back-button');
    this.title = page.getByTestId('movie-title');
    this.poster = page.getByTestId('movie-poster');
    this.posterSkeleton = page.getByTestId('movie-poster-skeleton');
  }

  async clickBack() {
    await this.backButton.click();
  }
}
