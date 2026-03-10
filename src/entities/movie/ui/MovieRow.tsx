import React from 'react';
import { TableRow, TableCell } from '@shared/ui/table';
import type { Movie } from '../model/types';
import { flexRender, type Row } from '@tanstack/react-table';

interface MovieRowProps {
  row: Row<Movie>;
  virtualRowIndex: number;
}

export const MovieRow = React.memo(({ row, virtualRowIndex }: MovieRowProps) => {
  return (
    <TableRow
      data-testid="movie-row"
      role="row"
      aria-rowindex={virtualRowIndex + 2} // 1-based index, +1 for header row
      className="cursor-pointer hover:bg-muted/50"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
});

MovieRow.displayName = 'MovieRow';
