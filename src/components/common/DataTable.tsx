import { ReactNode, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onExport?: () => void;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  idKey?: keyof T;
  emptyMessage?: string;
  actions?: ReactNode;
  loading?: boolean;
}

export function DataTable<T extends object>({
  data,
  columns,
  total,
  page,
  limit,
  onPageChange,
  onSearch,
  onSort,
  sortKey,
  sortDirection,
  onExport,
  selectable,
  selectedIds = [],
  onSelectionChange,
  idKey = 'id' as keyof T,
  emptyMessage = 'No data found',
  actions,
  loading,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(data.map(row => row[idKey] as string | number));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(i => i !== id));
    }
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          {onSearch && (
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8 h-8 text-sm w-full"
              />
            </div>
          )}
          {selectedIds.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedIds.length} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-8 text-xs">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {selectable && (
                <TableHead className="w-10 px-3">
                  <Checkbox
                    checked={allSelected || (someSelected ? 'indeterminate' : false)}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map(col => (
                <TableHead 
                  key={col.key}
                  className={cn("text-xs font-medium", col.className)}
                >
                  {col.sortable && onSort ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = row[idKey] as string | number;
                const isSelected = selectedIds.includes(rowId);
                return (
                  <TableRow 
                    key={rowId || index}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    {selectable && (
                      <TableCell className="px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectRow(rowId, !!checked)}
                        />
                      </TableCell>
                    )}
                    {columns.map(col => (
                      <TableCell key={col.key} className={cn("py-2 text-sm", col.className)}>
                        {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
