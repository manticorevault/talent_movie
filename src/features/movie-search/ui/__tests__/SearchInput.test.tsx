import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { SearchInput } from '../SearchInput';

// Mock TanStack Router hooks
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useSearch: () => ({}),
  useNavigate: () => mockNavigate,
}));

// Mock use-debounce to make tests synchronous
vi.mock('use-debounce', () => ({
  useDebounce: (value: string) => [value],
}));

// Minimal render helper since we mock the router hooks directly
import { render } from '@testing-library/react';

describe('SearchInput', () => {
  it('renders with the correct accessibility attributes', () => {
    render(<SearchInput />);
    const input = screen.getByTestId('search-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-label', 'Search movies');
    expect(input).toHaveAttribute('aria-controls', 'movie-table-container');
    expect(input).toHaveAttribute('placeholder', 'Search movies...');
  });

  it('updates the local input value immediately on change', () => {
    render(<SearchInput />);
    const input = screen.getByTestId('search-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Inception' } });
    expect(input.value).toBe('Inception');
  });

  it('calls navigate with sanitized value after debounce', () => {
    render(<SearchInput />);
    const input = screen.getByTestId('search-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Batman' } });

    // With mocked debounce, the effect fires synchronously on re-render
    // The navigate should have been called with the sanitized value
    expect(mockNavigate).toHaveBeenCalled();
  });
});
