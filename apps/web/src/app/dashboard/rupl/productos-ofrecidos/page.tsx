'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  precioReferencia: number | null;
  fotos: string[];
  productor: {
    id: string;
    razonSocial: string;
    nombreComercial: string | null;
    codigoMunicipio: string;
    calificacionPromedio: number;
  };
}

const categorias = [
  'fruta', 'verdura', 'hortaliza', 'lacteo', 'carnes', 'granos',
  'panaderia', 'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'miel', 'procesado', 'otros',
];

export default function ProductosOfrecidosPage() {
  const router = useRouter();
  const [data, setData] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (categoria) params.set('categoria', categoria);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await api.get<{ data: Producto[]; meta: { total: number } }>(
        `/rupl/productores/productos/buscar?${params.toString()}`
      );
      setData(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [q, categoria, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const clearFilters = () => {
    setQ('');
    setCategoria('');
    setPage(1);
  };

  const hasActiveFilters = !!(q || categoria);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:p-5">
        <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Productos Ofrecidos</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Productos de todos los productores del RUPL. Haz clic en Editar para actualizarlos.</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar producto..."
            className="min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <select
            value={categoria}
            onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-slate-600">
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <div key={p.id} className="flex flex-col rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                    {p.categoria}
                  </span>
                  {p.precioReferencia && (
                    <span className="text-right text-sm font-bold text-emerald-700">{formatCurrency(p.precioReferencia)}/{p.unidadMedida}</span>
                  )}
                </div>
                {p.fotos?.length > 0 && (
                  <div className="relative mb-3 h-40 w-full overflow-hidden rounded-lg bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.fotos[0]} alt={p.nombre} className="h-full w-full object-cover" />
                  </div>
                )}
                <h3 className="text-base font-semibold text-slate-800">{p.nombre}</h3>
                <p className="text-xs text-slate-400">
                  {p.volumenDisponible} {p.unidadMedida} disponibles
                </p>
                <div className="mt-3 flex flex-1 items-end justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">{p.productor.razonSocial}</p>
                    <p className="mt-0.5 text-xs text-slate-400">⭐ {Number(p.productor.calificacionPromedio).toFixed(1)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => p.productor.id && router.push(`/dashboard/rupl/${p.productor.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => p.productor.id && router.push(`/dashboard/rupl/${p.productor.id}/productos/${p.id}/editar`)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
              No se encontraron productos con los filtros seleccionados
            </div>
          )}

          {total > 20 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-500">Pág. {page} de {Math.ceil(total / 20)}</span>
              <button
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
