'use client';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="text-sm text-slate-500">
        Página {page} de {totalPages} ({total} registros)
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          Anterior
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const start = Math.max(1, Math.min(page - 2, totalPages - 4));
          const p = start + i;
          if (p > totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`rounded px-3 py-1 text-sm ${p === page ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
