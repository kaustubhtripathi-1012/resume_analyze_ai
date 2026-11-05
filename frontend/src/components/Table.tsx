import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.'
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted bg-surface rounded-xl border border-slate-200">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-surface">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 sticky top-0 font-medium text-slate-700">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.map((row, rowIdx) => (
            <tr
              key={keyExtractor(row)}
              className={`hover:bg-slate-50 transition-colors ${rowIdx % 2 === 1 ? 'bg-slate-50/40' : ''}`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-4 py-3 text-text ${col.className || ''}`}>
                  {col.render ? col.render(row) : col.accessor ? String(row[col.accessor] ?? '') : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

