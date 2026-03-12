import { startTransition, useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useGetGenresQuery } from '@entities/movie';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';
import { Skeleton } from '@shared/ui/skeleton';
import { Popover, PopoverTrigger, PopoverContent } from '@shared/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@shared/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { Slider } from '@shared/ui/slider';
import { Separator } from '@shared/ui/separator';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import { cn } from '@shared/lib/utils';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(CURRENT_YEAR - i));

/**
 * Collapsible filters panel with genre multi-select, year picker, and rating slider.
 * Reads filter state from URL search params and writes back via navigate().
 */
export function FiltersPanel() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const genresParam = (search.genres as string) ?? '';
  const yearParam = (search.year as string) ?? '';
  const ratingParam = search.rating !== undefined ? Number(search.rating) : 0;

  const [isOpen, setIsOpen] = useState(false);
  const [genrePopoverOpen, setGenrePopoverOpen] = useState(false);

  const { data: genresData, isLoading: genresLoading } = useGetGenresQuery();
  const genres = genresData?.genres ?? [];

  const selectedGenreIds = useMemo(
    () => (genresParam ? genresParam.split(',') : []),
    [genresParam],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedGenreIds.length > 0) count += 1;
    if (yearParam) count += 1;
    if (ratingParam > 0) count += 1;
    return count;
  }, [selectedGenreIds, yearParam, ratingParam]);

  const updateSearch = (updates: Record<string, unknown>) => {
    startTransition(() => {
      navigate({
        search: ((prev: Record<string, unknown>) => ({
          ...prev,
          ...updates,
          page: 1,
        })) as never,
      });
    });
  };

  const handleGenreToggle = (genreId: string) => {
    const updated = selectedGenreIds.includes(genreId)
      ? selectedGenreIds.filter((id) => id !== genreId)
      : [...selectedGenreIds, genreId];
    updateSearch({ genres: updated.length > 0 ? updated.join(',') : undefined });
  };

  const handleGenreRemove = (genreId: string) => {
    const updated = selectedGenreIds.filter((id) => id !== genreId);
    updateSearch({ genres: updated.length > 0 ? updated.join(',') : undefined });
  };

  const handleYearChange = (value: string) => {
    updateSearch({ year: value === 'all' ? undefined : value });
  };

  const handleRatingChange = (values: number[]) => {
    updateSearch({ rating: values[0] > 0 ? values[0] : undefined });
  };

  return (
    <div className="space-y-4">
      <Button
        data-testid="filters-toggle"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeFilterCount > 0 && (
          <Badge data-testid="filter-badge-count" variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="border-t-2 border-b-2 border-foreground bg-card p-6 space-y-6 shadow-xl">
          {/* Genre Multi-select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Genres</label>
            <Popover open={genrePopoverOpen} onOpenChange={setGenrePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {selectedGenreIds.length > 0
                    ? `${selectedGenreIds.length} genre(s) selected`
                    : 'Select genres...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                {genresLoading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <Command>
                    <CommandInput placeholder="Search genres..." />
                    <CommandList>
                      <CommandEmpty>No genres found.</CommandEmpty>
                      <CommandGroup>
                        {genres.map((genre) => {
                          const isSelected = selectedGenreIds.includes(String(genre.id));
                          return (
                            <CommandItem
                              key={genre.id}
                              value={genre.name}
                              onSelect={() => handleGenreToggle(String(genre.id))}
                            >
                              <Check
                                size={16}
                                className={cn('mr-2', isSelected ? 'opacity-100' : 'opacity-0')}
                              />
                              {genre.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
              </PopoverContent>
            </Popover>

            {/* Selected genre badges */}
            {selectedGenreIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedGenreIds.map((id) => {
                  const genreName = genres.find((g) => String(g.id) === id)?.name ?? id;
                  return (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {genreName}
                      <button
                        onClick={() => handleGenreRemove(id)}
                        className="ml-1 rounded-full outline-none hover:bg-muted"
                        aria-label={`Remove ${genreName} filter`}
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Release Year */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Release Year</label>
            <Select value={yearParam || 'all'} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Vote Average Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Min. Rating: <span className="text-primary font-bold">{ratingParam.toFixed(1)}</span>
            </label>
            <Slider
              min={0}
              max={10}
              step={0.5}
              value={[ratingParam]}
              onValueChange={handleRatingChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
