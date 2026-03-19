import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends Record<string, any>>({ columns, data, pageSize = 8, onRowClick }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="medibook-card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="medibook-table-header">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left whitespace-nowrap cursor-pointer select-none" onClick={() => col.sortable !== false && handleSort(col.key)}>
                  <span className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && <span className="text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((item, i) => (
              <tr key={i} className={`medibook-table-row ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(item)}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">{sorted.length} résultat{sorted.length > 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="text-sm font-medium">{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-1 rounded-lg hover:bg-muted disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
