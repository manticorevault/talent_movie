import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/table';
import { Button } from '@shared/ui/button';
import { Heart } from 'lucide-react';
import { selectFavoritesArray } from '@features/favorites';
import { FavoriteToggle } from '@features/favorites';
import type { Movie } from '@entities/movie';
import { Link } from '@tanstack/react-router';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Estimated row height in pixels for the virtualizer */
const ESTIMATED_ROW_HEIGHT = 48;
/** Overscan count for the virtualizer */
const OVERSCAN_COUNT = 5;
/** Visible table height in pixels */
const TABLE_HEIGHT = 600;

// ---------------------------------------------------------------------------
// Column definitions for the favorites table (client-side only)
// ---------------------------------------------------------------------------

const columns: ColumnDef<Movie, unknown>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <span className="font-medium">Title</span>,
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    size: 280,
  },
  {
    id: 'release_date',
    accessorKey: 'release_date',
    header: () => <span className="font-medium">Release Date</span>,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.release_date || '—'}</span>
    ),
    size: 140,
  },
  {
    id: 'vote_average',
    accessorKey: 'vote_average',
    header: () => <span className="font-medium">Rating</span>,
    cell: ({ row }) => <span>{row.original.vote_average.toFixed(1)}</span>,
    size: 100,
  },
  {
    id: 'original_language',
    accessorKey: 'original_language',
    header: () => <span className="font-medium">Language</span>,
    cell: ({ row }) => (
      <span className="uppercase text-xs font-mono">{row.original.original_language}</span>
    ),
    size: 100,
  },
  {
    id: 'popularity',
    accessorKey: 'popularity',
    header: () => <span className="font-medium">Popularity</span>,
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

// ---------------------------------------------------------------------------
// FavoritesList
// ---------------------------------------------------------------------------

export function FavoritesList() {
  const favorites = useSelector(selectFavoritesArray);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: favorites,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  // --- Empty state ---
  if (favorites.length === 0) {
    return (
      <div
        data-testid="favorites-empty"
        className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground"
      >
        <Heart size={64} strokeWidth={1.5} className="text-[#FF694D]" />
        <p className="text-xl font-medium">No favorites yet</p>
        <p className="text-sm">Movies you add to favorites will appear here.</p>
        <Button asChild variant="outline">
          <Link to="/">Browse Movies</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      role="grid"
      aria-label="Favorites"
      aria-rowcount={favorites.length}
      style={{ overflowY: 'auto', maxHeight: `${TABLE_HEIGHT}px` }}
      className="rounded-[36px] border bg-card shadow-sm overflow-hidden"
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} role="row">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} role="columnheader" style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
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
        </TableBody>
      </Table>
    </div>
  );
}
