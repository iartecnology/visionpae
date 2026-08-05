'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ProductoBase {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedidaDefecto: string;
  fotoUrl: string | null;
  certificacionesRequeridas: string[];
  atributosSchema: Record<string, string[]> | null;
  _count?: { ofrecidos: number };
}

const categorias = [
  'fruta', 'verdura', 'hortaliza', 'tuberculos', 'lacteo', 'carnes', 'granos',
  'panaderia', 'preparaciones', 'bebidas', 'huevos', 'miel', 'procesado', 'otros',
];

const categoriaLabels: Record<string, string> = {
  fruta: 'Fruta', verdura: 'Verdura', hortaliza: 'Hortaliza', tuberculos: 'Tubérculo',
  lacteo: 'Lácteo', carnes: 'Carnes', granos: 'Granos', panaderia: 'Panadería',
  preparaciones: 'Preparación', bebidas: 'Bebida', huevos: 'Huevos', miel: 'Miel',
  procesado: 'Procesado', otros: 'Otros',
};

export default function CatalogoPage() {
  const router = useRouter();
  const [data, setData] = useState<ProductoBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (categoria) params.set('categoria', categoria);
      params.set('limit', '200');
      const res = await api.get<{ data: ProductoBase[] }>(`/catalogo/productos?${params.toString()}`);
      const items = (res.data || []).filter((p) => (p._count?.ofrecidos ?? 0) > 0);
      setData(items);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [q, categoria]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasActiveFilters = !!(q || categoria);
  const activeFilterCount = (q ? 1 : 0) + (categoria ? 1 : 0);

  const clearFilters = () => { setQ(''); setCategoria(''); };

  const activeFilterChips = (() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (q) chips.push({ label: `"${q}"`, onRemove: () => setQ('') });
    if (categoria) chips.push({ label: categoriaLabels[categoria] || categoria, onRemove: () => setCategoria('') });
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
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto..."
            className="min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{categoriaLabels[c] || c}</option>)}
          </select>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/catalogo/${p.id}`)}
                className="cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
              >
                {p.fotoUrl ? (
                  <div className="relative mb-3 h-36 w-full overflow-hidden rounded-lg bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.fotoUrl} alt={p.nombre} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="relative mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-slate-100 text-4xl">
                    🛒
                  </div>
                )}
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                    {categoriaLabels[p.categoria] || p.categoria}
                  </span>
                  <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                    {p._count?.ofrecidos ?? 0} oferente{(p._count?.ofrecidos ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-800">{p.nombre}</h3>
                <p className="mt-0.5 text-xs text-slate-400">Unidad: {p.unidadMedidaDefecto || '—'}</p>
                {p.atributosSchema && Object.keys(p.atributosSchema).length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-400">{Object.keys(p.atributosSchema).join(' · ')}</p>
                )}
              </div>
            ))}
          </div>

          {data.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
              No se encontraron productos con los filtros seleccionados
            </div>
          )}
        </>
      )}

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-0">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-800">Filtros</h3>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs font-medium text-primary">Limpiar todo</button>
                  )}
                  <button onClick={() => setShowMobileFilters(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
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
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre del producto..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary">
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => <option key={c} value={c}>{categoriaLabels[c] || c}</option>)}
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
              <button onClick={() => setShowMobileFilters(false)} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
                Ver {data.length} producto{data.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
