'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { LocationFilter } from '@/components/location-filter';

interface ProductoCatalogo {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  precioReferencia: number | null;
  fotos: string[];
  productor: {
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

export default function CatalogoPage() {
  const router = useRouter();
  const [data, setData] = useState<ProductoCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ubicacion, setUbicacion] = useState<{ pais?: string; departamento?: string; municipio?: string }>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (categoria) params.set('categoria', categoria);
      if (ubicacion.municipio) params.set('codigoMunicipio', ubicacion.municipio);
      params.set('page', String(page));
      params.set('limit', '20');

      const res = await api.get<{ data: ProductoCatalogo[]; meta: { total: number } }>(
        `/rupl/productores/productos/buscar?${params.toString()}`
      );
      setData(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [q, categoria, ubicacion, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasActiveFilters = !!(q || categoria || ubicacion.departamento || ubicacion.municipio);
  const activeFilterCount = (q ? 1 : 0) + (categoria ? 1 : 0) + (ubicacion.departamento ? 1 : 0);

  const clearFilters = () => {
    setQ('');
    setCategoria('');
    setUbicacion({});
    setPage(1);
  };

  const activeFilterChips = (() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (q) chips.push({ label: `"${q}"`, onRemove: () => { setQ(''); setPage(1); } });
    if (categoria) chips.push({ label: categoria, onRemove: () => { setCategoria(''); setPage(1); } });
    if (ubicacion.departamento) chips.push({ label: '📍 Ubicación', onRemove: () => { setUbicacion({}); setPage(1); } });
    return chips;
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:p-5">
        <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Catálogo de Productos</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Explora productos publicados por los proveedores locales</p>

        {/* Desktop filters */}
        <div className="mt-4 hidden flex-wrap items-center gap-3 sm:flex">
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
          <LocationFilter
            value={ubicacion}
            onChange={(v) => { setUbicacion({ pais: v.pais, departamento: v.departamento, municipio: v.municipio }); setPage(1); }}
          />
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors sm:hidden',
            hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {activeFilterChips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                {chip.label}
                <button onClick={chip.onRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-[11px] text-slate-400 hover:text-slate-600 ml-1">
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/rupl/${p.productor.razonSocial ? '#' : ''}`)}
                className="cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg sm:p-5"
              >
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
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-sm font-medium text-slate-700">{p.productor.razonSocial}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <span>⭐ {Number(p.productor.calificacionPromedio).toFixed(1)}</span>
                    {p.productor.codigoMunicipio && <span>📍 {p.productor.codigoMunicipio}</span>}
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

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-0">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-800">Filtros</h3>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs font-medium text-primary">
                      Limpiar todo
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 py-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Buscar producto</label>
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder="Nombre del producto..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Ubicación</label>
                <LocationFilter
                  compact
                  value={ubicacion}
                  onChange={(v) => { setUbicacion({ pais: v.pais, departamento: v.departamento, municipio: v.municipio }); setPage(1); }}
                />
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Ver {total} resultado{total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
