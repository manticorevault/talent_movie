import { useCallback, useMemo, useRef, startTransition } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Skeleton } from '@shared/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@shared/ui/tooltip';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Film,
  CircleAlert,
  Loader2,
} from 'lucide-react';
import type { Movie, MoviesResponse } from '@entities/movie';
import { useMovieSearch } from '@features/movie-search';
import { SearchInput } from '@features/movie-search';
import { FiltersPanel } from '@features/movie-filters';
import { FavoriteToggle } from '@features/favorites';
import { setSortBy } from '@features/movie-sort';

/** Number of skeleton placeholder rows shown during loading */
const SKELETON_ROW_COUNT = 10;
/** Estimated row height in pixels for the virtualizer */
const ESTIMATED_ROW_HEIGHT = 48;
/** Overscan count for the virtualizer */
const OVERSCAN_COUNT = 5;
/** Visible table height in pixels */
const TABLE_HEIGHT = 600;

// ---------------------------------------------------------------------------
// Column definitions — stable reference via module-level const
// ---------------------------------------------------------------------------

function createColumns(
  isTextSearch: boolean,
  currentSort: string,
  onSortChange: (columnId: string) => void,
): ColumnDef<Movie, unknown>[] {
  /** Renders a sort header button for a given column */
  const SortHeader = ({ columnId, label }: { columnId: string; label: string }) => {
    // Derive current sort direction for this column from the TMDB sort_by string
    const [sortField, sortDir] = currentSort ? currentSort.split('.') : ['', ''];
    const isActive = sortField === columnId;
    const direction = isActive ? (sortDir as 'asc' | 'desc') : null;

    const icon =
      direction === 'asc' ? (
        <ChevronUp size={14} />
      ) : direction === 'desc' ? (
        <ChevronDown size={14} />
      ) : (
        <ChevronsUpDown size={14} className="text-muted-foreground" />
      );

    const ariaSort =
      direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';

    const button = (
      <Button
        data-testid={`sort-header-${columnId}`}
        variant="ghost"
        size="sm"
        className="gap-1 -ml-3 h-8"
        disabled={isTextSearch}
        onClick={() => onSortChange(columnId)}
        aria-label={`Sort by ${label}`}
        aria-sort={ariaSort}
      >
        {label}
        {icon}
      </Button>
    );

    if (isTextSearch) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>Sorting is unavailable during text search</TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return [
    {
      id: 'title',
      accessorKey: 'title',
      header: () => <SortHeader columnId="title" label="Title" />,
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
      size: 280,
    },
    {
      id: 'release_date',
      accessorKey: 'release_date',
      header: () => <SortHeader columnId="release_date" label="Release Date" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.release_date || '—'}</span>
      ),
      size: 140,
    },
    {
      id: 'vote_average',
      accessorKey: 'vote_average',
      header: () => <SortHeader columnId="vote_average" label="Rating" />,
      cell: ({ row }) => <span>{row.original.vote_average.toFixed(1)}</span>,
      size: 100,
    },
    {
      id: 'original_language',
      accessorKey: 'original_language',
      header: () => <SortHeader columnId="original_language" label="Language" />,
      cell: ({ row }) => (
        <span className="uppercase text-xs font-mono">{row.original.original_language}</span>
      ),
      size: 100,
    },
    {
      id: 'popularity',
      accessorKey: 'popularity',
      header: () => <SortHeader columnId="popularity" label="Popularity" />,
      cell: ({ row }) => <span>{row.original.popularity.toFixed(0)}</span>,
      size: 120,
    },
    {
      id: 'favorite',
      header: () => null,
      cell: ({ row }) => <FavoriteToggle movie={row.original} />,
      size: 50,
    },
  ];
}

// ---------------------------------------------------------------------------
// Skeleton rows component
// ---------------------------------------------------------------------------

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow
          key={`skeleton-${i}`}
          data-testid="skeleton-row"
          role="status"
          aria-label="Loading"
        >
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// MovieTable
// ---------------------------------------------------------------------------

export function MovieTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const currentPage = search.page !== undefined ? Number(search.page) : 1;
  const currentSort = (search.sort as string) ?? 'popularity.desc';

  const { data, isFetching, isLoading, isError, refetch, isTextSearch } = useMovieSearch();

  const movies = (data as MoviesResponse | undefined)?.results ?? [];
  const totalPages = (data as MoviesResponse | undefined)?.total_pages ?? 0;
  const totalResults = (data as MoviesResponse | undefined)?.total_results ?? 0;

  // --- Sort handler ---
  const handleSortChange = useCallback(
    (columnId: string) => {
      const [sortField, sortDir] = currentSort.split('.');
      let nextSort: string;
      if (sortField === columnId) {
        // Toggle direction
        nextSort = sortDir === 'desc' ? `${columnId}.asc` : `${columnId}.desc`;
      } else {
        nextSort = `${columnId}.desc`;
      }
      // Sync Redux sortSlice with the new sort value
      dispatch(setSortBy(nextSort));
      startTransition(() => {
        navigate({
          // @ts-expect-error - Route parameter strict typing mismatch natively
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            sort: nextSort,
            page: 1,
          }),
        });
      });
    },
    [currentSort, navigate, dispatch],
  );

  // --- Pagination handlers ---
  const handlePageChange = useCallback(
    (newPage: number) => {
      startTransition(() => {
        navigate({
          // @ts-expect-error - Route parameter strict typing mismatch natively
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            page: newPage,
          }),
        });
      });
    },
    [navigate],
  );

  // --- Columns (memoized with dependencies) ---
  const columns = useMemo(
    () => createColumns(isTextSearch, currentSort, handleSortChange),
    [isTextSearch, currentSort, handleSortChange],
  );

  // --- TanStack Table instance ---
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: movies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      pagination: { pageIndex: currentPage - 1, pageSize: 20 },
    },
  });

  const { rows } = table.getRowModel();

  // --- Virtualizer ---
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_COUNT,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom = virtualizer.getTotalSize() - (virtualItems.at(-1)?.end ?? 0);

  // --- Row click handler ---
  // Route `/movies/$movieId` will be defined in Track 5; cast to satisfy strict router types
  const handleRowClick = useCallback(
    (movieId: number) => {
      (navigate as (opts: { to: string; params?: Record<string, string> }) => void)({
        to: `/movies/${movieId}`,
      });
    },
    [navigate],
  );

  // --- Error state ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-destructive">
        <CircleAlert size={48} />
        <p className="text-lg font-medium">Something went wrong</p>
        <p className="text-sm text-muted-foreground">Failed to load movies. Please try again.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SearchInput />
          <FiltersPanel />
        </div>

        {/* Table */}
        <div
          id="movie-table-container"
          ref={tableContainerRef}
          role="grid"
          aria-label="Movies"
          aria-rowcount={totalResults || -1}
          style={{ overflowY: 'auto', maxHeight: `${TABLE_HEIGHT}px` }}
          className="rounded-[36px] border bg-card shadow-sm overflow-hidden"
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} role="row">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      role="columnheader"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && movies.length === 0) ? (
                <SkeletonRows count={SKELETON_ROW_COUNT} />
              ) : movies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Film size={48} />
                      <p className="text-lg font-medium">No movies found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Top padding spacer for virtualization */}
                  {paddingTop > 0 && (
                    <tr aria-hidden="true">
                      <td style={{ height: paddingTop }} />
                    </tr>
                  )}

                  {virtualItems.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <TableRow
                        key={row.id}
                        data-testid="movie-row"
                        role="row"
                        aria-rowindex={virtualRow.index + 2}
                        className="cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => handleRowClick(row.original.id)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}

                  {/* Bottom padding spacer for virtualization */}
                  {paddingBottom > 0 && (
                    <tr aria-hidden="true">
                      <td style={{ height: paddingBottom }} />
                    </tr>
                  )}
                </>
              )}
            </TableBody>
          </Table>

          {/* Fetching overlay (page transitions) */}
          {isFetching && movies.length > 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
              {totalResults > 0 && ` · ${totalResults.toLocaleString()} results`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                data-testid="pagination-prev"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || isFetching}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <Button
                data-testid="pagination-next"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || isFetching}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next page"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
