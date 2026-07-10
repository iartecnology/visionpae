import React from 'react';

interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  keyExtractor: (item: any) => string;
  onRowClick?: (item: any) => void;
}

export function Table({ columns, data, keyExtractor, onRowClick }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((item: any) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
