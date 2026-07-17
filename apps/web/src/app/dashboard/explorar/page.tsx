'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProductorMapa } from '@/components/mapa/explorar-map';
import { StarRating } from '@/components/star-rating';
import { cn } from '@/lib/utils';
import { useApiGet } from '@/lib/swr-api';
import { LocationFilter } from '@/components/location-filter';

const ExplorarMap = dynamic(() => import('@/components/mapa/explorar-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Cargando mapa…
    </div>
  ),
});

const CATEGORIAS = [
  { value: 'fruta', label: '🍎 Fruta' },
  { value: 'verdura', label: '🥬 Verdura' },
  { value: 'lacteo', label: '🥛 Lácteo' },
  { value: 'carnes', label: '🥩 Carnes' },
  { value: 'granos', label: '🫘 Granos' },
  { value: 'panaderia', label: '🍞 Panadería' },
  { value: 'preparaciones', label: '🍲 Preparaciones' },
  { value: 'bebidas', label: '🧃 Bebidas' },
  { value: 'huevos', label: '🥚 Huevos' },
  { value: 'tuberculos', label: '🥔 Tubérculos' },
  { value: 'otros', label: '📦 Otros' },
];

const TIPO_PERSONA = [
  { value: '', label: 'Todos los tipos' },
  { value: 'natural', label: 'Persona Natural' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'acfc', label: 'ACFC' },
  { value: 'comunidad_etnica', label: 'Comunidad Étnica' },
];

const ESTRATOS = [
  { value: '', label: 'Todos los estratos' },
  { value: 'campesino', label: 'Campesino' },
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
];

export default function ExplorarPage() {
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [tipoPersona, setTipoPersona] = useState('');
  const [estrato, setEstrato] = useState('');
  const [calificacionMin, setCalificacionMin] = useState(0);
  const [ubicacion, setUbicacion] = useState<{ departamento?: string; municipio?: string }>({});
  const [selected, setSelected] = useState<ProductorMapa | null>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set('producto', search);
    selectedCats.forEach((c) => p.append('categorias', c));
    if (ubicacion.departamento) p.set('codigoDepartamento', ubicacion.departamento);
    if (ubicacion.municipio) p.set('codigoMunicipio', ubicacion.municipio);
    if (tipoPersona) p.set('tipoPersona', tipoPersona);
    if (estrato) p.set('estrato', estrato);
    if (calificacionMin > 0) p.set('calificacionMin', String(calificacionMin));
    return p.toString();
  }, [search, selectedCats, ubicacion, tipoPersona, estrato, calificacionMin]);

  const { data, isLoading } = useApiGet<ProductorMapa[]>(`/rupl/mapa?${params}`);
  const productores = Array.isArray(data) ? data : [];

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const hasActiveFilters = search || selectedCats.length > 0 || ubicacion.departamento || tipoPersona || estrato || calificacionMin > 0;

  const clearFilters = () => {
    setSearch('');
    setSelectedCats([]);
    setTipoPersona('');
    setEstrato('');
    setCalificacionMin(0);
    setUbicacion({});
  };

  const mapCenter = useMemo<[number, number]>(() => {
    if (selected) return [Number(selected.latitud), Number(selected.longitud)];
    if (productores.length > 0) {
      const avgLat = productores.reduce((s, p) => s + Number(p.latitud), 0) / productores.length;
      const avgLng = productores.reduce((s, p) => s + Number(p.longitud), 0) / productores.length;
      return [avgLat, avgLng];
    }
    return [5.5, -73.5];
  }, [productores, selected]);

  const [showMobileMap, setShowMobileMap] = useState(false);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      {/* Mobile toggle */}
      <div className="flex gap-2 lg:hidden">
        <button
          onClick={() => setShowMobileMap(false)}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', !showMobileMap ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600')}
        >
          Lista
        </button>
        <button
          onClick={() => setShowMobileMap(true)}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', showMobileMap ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600')}
        >
          Mapa
        </button>
      </div>

      {/* Sidebar: filters + results */}
      <div className={cn(
        'flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        'w-full lg:w-80',
        showMobileMap ? 'hidden lg:flex' : 'flex'
      )}>
        {/* Search */}
        <div className="border-b border-slate-100 p-3">
          <div className="relative">
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-0 border-b border-slate-100">
          {/* Categories */}
          <div className="px-3 pt-2.5 pb-2">
            <p className="mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">📂 Categorías</p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => toggleCat(cat.value)}
                  className={cn(
                    'rounded-lg px-2 py-1.5 text-xs text-left transition-colors',
                    selectedCats.includes(cat.value)
                      ? 'bg-primary text-white font-medium shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location + Type row */}
          <div className="grid grid-cols-2 gap-3 px-3 pb-2.5">
            <div>
              <p className="mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">📍 Ubicación</p>
              <LocationFilter
                compact
                value={ubicacion}
                onChange={(v) => setUbicacion({ departamento: v.departamento, municipio: v.municipio })}
              />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">👤 Productor</p>
              <select
                value={tipoPersona}
                onChange={(e) => setTipoPersona(e.target.value)}
                className="mb-1.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-primary"
              >
                {TIPO_PERSONA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select
                value={estrato}
                onChange={(e) => setEstrato(e.target.value)}
                className="mb-1.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-primary"
              >
                {ESTRATOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
              <select
                value={calificacionMin}
                onChange={(e) => setCalificacionMin(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-primary"
              >
                <option value={0}>⭐ Cualquier calificación</option>
                <option value={3}>⭐ 3+ estrellas</option>
                <option value={4}>⭐ 4+ estrellas</option>
                <option value={4.5}>⭐ 4.5+ estrellas</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="px-3 pb-2.5">
              <button onClick={clearFilters} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400">
              {isLoading ? 'Buscando…' : `${productores.length} resultado${productores.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-400">Cargando…</div>
          ) : productores.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              <p className="text-lg mb-1">🔍</p>
              <p>No se encontraron productores</p>
              <p className="mt-1 text-xs text-slate-300">Intenta con otros filtros</p>
            </div>
          ) : (
            productores.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={cn(
                  'w-full border-b border-slate-50 p-3 text-left transition-colors hover:bg-primary/[0.06]',
                  selected?.id === p.id ? 'bg-primary/[0.08]' : ''
                )}
              >
                <p className="text-sm font-medium text-slate-800">{p.razonSocial}</p>
                {p.nombreComercial && (
                  <p className="text-xs text-slate-400">{p.nombreComercial}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={Number(p.calificacionPromedio)} size="sm" />
                  <span className="text-[10px] text-slate-400">
                    {p.tipoPersona === 'natural' ? 'Natural' : p.tipoPersona?.replace(/_/g, '')}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.productos.slice(0, 3).map((prod) => (
                    <span key={prod.id} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {prod.nombre}
                      {prod.precioReferencia ? ` $${Number(prod.precioReferencia).toLocaleString('es-CO')}` : ''}
                    </span>
                  ))}
                  {p.productos.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{p.productos.length - 3}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div className={cn(
        'flex-1 overflow-hidden rounded-xl border border-slate-200 shadow-sm',
        showMobileMap ? 'flex' : 'hidden lg:flex'
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
