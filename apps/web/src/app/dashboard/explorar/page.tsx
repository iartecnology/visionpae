'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import type { ProductorMapa } from '@/components/mapa/explorar-map';
import Link from 'next/link';
import { StarRating } from '@/components/star-rating';
import { cn } from '@/lib/utils';

const ExplorarMap = dynamic(() => import('@/components/mapa/explorar-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Cargando mapa…
    </div>
  ),
});

const CATEGORIAS = [
  'fruta', 'verdura', 'lacteo', 'carnes', 'granos', 'panaderia',
  'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'otros',
];

export default function ExplorarPage() {
  const [productores, setProductores] = useState<ProductorMapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selected, setSelected] = useState<ProductorMapa | null>(null);

  const fetchMapa = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      selectedCats.forEach((c) => params.append('categorias', c));
      const data = await api.get<ProductorMapa[]>(`/rupl/mapa?${params}`);
      setProductores(Array.isArray(data) ? data : []);
    } catch {
      setProductores([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCats]);

  useEffect(() => {
    fetchMapa();
  }, [fetchMapa]);

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const mapCenter = useMemo<[number, number]>(() => {
    if (selected) return [Number(selected.latitud), Number(selected.longitud)];
    if (productores.length > 0) {
      const avgLat =
        productores.reduce((s, p) => s + Number(p.latitud), 0) / productores.length;
      const avgLng =
        productores.reduce((s, p) => s + Number(p.longitud), 0) / productores.length;
      return [avgLat, avgLng];
    }
    return [5.5, -73.5]; // Boyacá center
  }, [productores, selected]);

  const [showMobileList, setShowMobileList] = useState(true);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      {/* Mobile toggle */}
      <div className="flex gap-2 lg:hidden">
        <button
          onClick={() => setShowMobileList(true)}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', showMobileList ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600')}
        >
          Lista
        </button>
        <button
          onClick={() => setShowMobileList(false)}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', !showMobileList ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600')}
        >
          Mapa
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        'w-full lg:w-80',
        'lg:flex', // always visible on desktop
        showMobileList ? 'flex' : 'hidden lg:flex' // toggle on mobile
      )}>
        {/* Search & filters */}
        <div className="border-b border-slate-100 p-3">
          <input
            type="text"
            placeholder="Buscar productor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  selectedCats.includes(cat)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-400">Cargando…</div>
          ) : productores.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">
              No se encontraron productores
            </div>
          ) : (
            productores.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full border-b border-slate-50 p-3 text-left transition-colors hover:bg-emerald-50 ${
                  selected?.id === p.id ? 'bg-emerald-50 ring-1 ring-emerald-200' : ''
                }`}
              >
                <p className="text-sm font-medium text-slate-800">{p.razonSocial}</p>
                {p.nombreComercial && (
                  <p className="text-xs text-slate-400">✨ {p.nombreComercial}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={Number(p.calificacionPromedio)} size="sm" />
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      p.estado === 'activo'
                        ? 'bg-green-100 text-green-700'
                        : p.estado === 'en_acreditacion'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.productos.slice(0, 3).map((prod) => (
                    <span
                      key={prod.id}
                      className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600"
                    >
                      {prod.nombre}
                    </span>
                  ))}
                  {p.productos.length > 3 && (
                    <span className="text-[10px] text-slate-400">
                      +{p.productos.length - 3}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 p-2 text-center text-[10px] text-slate-400">
          {productores.length} productor{productores.length !== 1 ? 'es' : ''} en el mapa
        </div>
      </div>

      {/* Map */}
      <div className={cn(
        'flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm',
        showMobileList ? 'hidden lg:flex' : 'flex'
      )}>
        <ExplorarMap
          productores={productores}
          center={mapCenter}
          zoom={selected ? 14 : 9}
        />
      </div>
    </div>
  );
}
