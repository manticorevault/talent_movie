import { startTransition, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useDebounce } from 'use-debounce';
import { Input } from '@shared/ui/input';
import { sanitizeInput } from '@shared/lib/sanitize';
import { Search } from 'lucide-react';

/**
 * Debounced search input that updates the URL `?q=` param.
 * - Local state keeps the input responsive on every keystroke.
 * - After 300ms debounce, `navigate()` is called inside `startTransition`
 *   so the resulting table re-render is non-urgent.
 */
export function SearchInput() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const urlQuery = (search.q as string) ?? '';

  const [inputValue, setInputValue] = useState(urlQuery);
  const [debouncedValue] = useDebounce(inputValue, 300);

  // Track whether this is the initial mount to skip the first effect run
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const sanitized = sanitizeInput(debouncedValue);
    startTransition(() => {
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          q: sanitized || undefined,
          page: 1,
        }),
      });
    });
  }, [debouncedValue, navigate]);

  return (
    <div className="relative w-full max-w-sm">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        data-testid="search-input"
        aria-label="Search movies"
        placeholder="Search movies..."
        className="pl-9"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
}
