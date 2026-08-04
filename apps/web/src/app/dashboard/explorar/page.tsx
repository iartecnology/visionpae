'use client';

import { useState, useMemo, useRef } from 'react';
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
  { value: '', label: 'Todas' },
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

const PRODUCTOS_EJEMPLO = [
  'Fresas', 'Manzanas', 'Leche', 'Queso', 'Huevos',
  'Papa', 'Yuca', 'Carne de res', 'Pollo', 'Pan',
];

export default function ExplorarPage() {
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [tipoPersona, setTipoPersona] = useState('');
  const [estrato, setEstrato] = useState('');
  const [calificacionMin, setCalificacionMin] = useState(0);
  const [ubicacion, setUbicacion] = useState<{ pais?: string; departamento?: string; municipio?: string }>({});
  const [selected, setSelected] = useState<ProductorMapa | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    setSelected(null);
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

  const [mobileView, setMobileView] = useState<'split' | 'map'>('split');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (search) chips.push({ label: `"${search}"`, onRemove: () => setSearch('') });
    selectedCats.forEach((c) => {
      const cat = CATEGORIAS.find((cat) => cat.value === c);
      if (cat) chips.push({ label: cat.label, onRemove: () => toggleCat(c) });
    });
    if (tipoPersona) {
      const t = TIPO_PERSONA.find((t) => t.value === tipoPersona);
      if (t) chips.push({ label: t.label, onRemove: () => setTipoPersona('') });
    }
    if (estrato) {
      const e = ESTRATOS.find((e) => e.value === estrato);
      if (e) chips.push({ label: e.label, onRemove: () => setEstrato('') });
    }
    if (calificacionMin > 0) chips.push({ label: `${calificacionMin}+ estrellas`, onRemove: () => setCalificacionMin(0) });
    if (ubicacion.departamento) chips.push({ label: '📍 Ubicación', onRemove: () => setUbicacion({}) });
    return chips;
  }, [search, selectedCats, tipoPersona, estrato, calificacionMin, ubicacion]);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Search bar */}
      <div className="relative z-20 shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar producto o productor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-base outline-none transition-colors focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <LocationFilter
              compact
              value={ubicacion}
              onChange={(v) => setUbicacion({ pais: v.pais, departamento: v.departamento, municipio: v.municipio })}
            />
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors sm:hidden',
              hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {activeFilterChips.length}
              </span>
            )}
          </button>
        </div>

        {/* Category pills */}
        <div className="mx-auto mt-3 max-w-7xl">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  if (cat.value === '') {
                    setSelectedCats([]);
                  } else {
                    toggleCat(cat.value);
                  }
                }}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap',
                  cat.value === ''
                    ? selectedCats.length === 0
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    : selectedCats.includes(cat.value)
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="mx-auto mt-2 flex max-w-7xl flex-wrap items-center gap-1.5">
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

        {/* Desktop filters row */}
        <div className="mx-auto mt-3 hidden max-w-7xl items-center gap-3 sm:flex">
          <select
            value={tipoPersona}
            onChange={(e) => setTipoPersona(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
          >
            {TIPO_PERSONA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={estrato}
            onChange={(e) => setEstrato(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
          >
            {ESTRATOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select
            value={calificacionMin}
            onChange={(e) => setCalificacionMin(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary bg-white"
          >
            <option value={0}>⭐ Cualquier calificación</option>
            <option value={3}>⭐ 3+ estrellas</option>
            <option value={4}>⭐ 4+ estrellas</option>
            <option value={4.5}>⭐ 4.5+ estrellas</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">
            {isLoading ? 'Buscando…' : `${productores.length} resultado${productores.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Results + Map */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Map */}
        <div className={cn(
          'relative order-1 shrink-0 overflow-hidden transition-all duration-300',
          mobileView === 'map' ? 'flex-1' : 'h-[35vh]',
          'lg:order-2 lg:h-auto lg:flex-1'
        )}>
          <ExplorarMap
            productores={productores}
            center={mapCenter}
            zoom={selected ? 14 : 9}
          />
          {/* Mobile map toggle */}
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'split' : 'map')}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur-sm lg:hidden"
          >
            {mobileView === 'map' ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
                </svg>
                Ver listado
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                Ver mapa
              </>
            )}
          </button>
        </div>

        {/* Results list */}
        <div className={cn(
          'order-2 flex flex-col overflow-hidden',
          mobileView === 'map' ? 'hidden' : 'flex-1',
          'lg:flex lg:w-[420px] lg:min-w-[420px]'
        )}>
          <div className="flex-1 overflow-y-auto bg-white">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-sm text-slate-400">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
                <p>Buscando productores…</p>
              </div>
            ) : productores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-sm text-slate-400">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  🔍
                </div>
                <p className="font-medium text-slate-500">No se encontraron resultados</p>
                <p className="mt-1 text-xs text-slate-300">Intenta con otros filtros o productos</p>
                {!hasActiveFilters && (
                  <div className="mt-6">
                    <p className="mb-2 text-xs text-slate-400">Productos populares</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {PRODUCTOS_EJEMPLO.map((prod) => (
                        <button
                          key={prod}
                          onClick={() => setSearch(prod)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-primary hover:text-primary transition-colors"
                        >
                          {prod}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="sticky top-0 border-b border-slate-100 bg-white px-4 py-2.5">
                  <p className="text-xs font-medium text-slate-400">
                    {productores.length} productor{productores.length !== 1 ? 'es' : ''} encontrado{productores.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {productores.map((p) => {
                  const initial = (p.razonSocial || '?').charAt(0).toUpperCase();
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelected(p);
                        setMobileView('map');
                      }}
                      className={cn(
                        'w-full border-b border-slate-50 px-4 py-3.5 text-left transition-all hover:bg-primary/[0.03]',
                        selected?.id === p.id ? 'bg-primary/[0.06] ring-1 ring-primary/20 ring-inset' : ''
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm"
                          style={{ background: 'linear-gradient(135deg, var(--tenant-primary), var(--tenant-gradient-end))' }}
                        >
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 truncate">{p.razonSocial}</p>
                            <span className={cn(
                              'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                              p.estado === 'activo'
                                ? 'bg-green-100 text-green-700'
                                : p.estado === 'en_acreditacion'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-slate-100 text-slate-500'
                            )}>
                              {p.estado === 'en_acreditacion' ? 'Acreditación' : p.estado}
                            </span>
                          </div>
                          {p.nombreComercial && (
                            <p className="text-xs text-slate-400 truncate">{p.nombreComercial}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <StarRating value={Number(p.calificacionPromedio)} size="sm" />
                            <span className="text-[10px] text-slate-400">
                              {p.tipoPersona === 'natural' ? 'Persona Natural' : p.tipoPersona?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {p.productos.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {p.productos.slice(0, 4).map((prod) => (
                                <span key={prod.id} className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200/50">
                                  {prod.nombre}
                                  {prod.precioReferencia ? (
                                    <span className="font-medium text-emerald-600">${Number(prod.precioReferencia).toLocaleString('es-CO')}</span>
                                  ) : null}
                                  {prod.unidadMedida && (
                                    <span className="text-slate-400">/{prod.unidadMedida}</span>
                                  )}
                                </span>
                              ))}
                              {p.productos.length > 4 && (
                                <span className="text-[10px] text-slate-400">+{p.productos.length - 4} más</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

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
              {/* Ubicación */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Ubicación</label>
                <LocationFilter
                  compact
                  value={ubicacion}
                  onChange={(v) => setUbicacion({ pais: v.pais, departamento: v.departamento, municipio: v.municipio })}
                />
              </div>

              {/* Tipo de persona */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Tipo de persona</label>
                <select
                  value={tipoPersona}
                  onChange={(e) => setTipoPersona(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  {TIPO_PERSONA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Estrato */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Estrato</label>
                <select
                  value={estrato}
                  onChange={(e) => setEstrato(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  {ESTRATOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>

              {/* Calificación */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Calificación mínima</label>
                <select
                  value={calificacionMin}
                  onChange={(e) => setCalificacionMin(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value={0}>Cualquier calificación</option>
                  <option value={3}>3+ estrellas</option>
                  <option value={4}>4+ estrellas</option>
                  <option value={4.5}>4.5+ estrellas</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Ver {productores.length} resultado{productores.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
