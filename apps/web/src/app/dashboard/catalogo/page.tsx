'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { LocationFilter } from '@/components/location-filter';

interface ProductoCatalogo {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  precioReferencia: number | null;
  productor: {
    razonSocial: string;
    nombreComercial: string | null;
    codigoMunicipio: string;
    calificacionPromedio: number;
  };
}

const categorias = [
  'fruta', 'verdura', 'lacteo', 'carnes', 'granos',
  'panaderia', 'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'otros',
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">Catálogo de Productos</h1>
        <p className="mt-1 text-sm text-slate-500">Explora productos publicados por los proveedores locales</p>

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
          <LocationFilter
            value={ubicacion}
            onChange={(v) => { setUbicacion({ pais: v.pais, departamento: v.departamento, municipio: v.municipio }); setPage(1); }}
          />
        </div>
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
                className="cursor-pointer rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                    {p.categoria}
                  </span>
                  {p.precioReferencia && (
                    <span className="text-sm font-bold text-emerald-700">{formatCurrency(p.precioReferencia)}/{p.unidadMedida}</span>
                  )}
                </div>
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
    </div>
  );
}
