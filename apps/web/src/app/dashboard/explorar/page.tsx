'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProductorMapa } from '@/components/mapa/explorar-map';
import Link from 'next/link';
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
  'fruta', 'verdura', 'lacteo', 'carnes', 'granos', 'panaderia',
  'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'otros',
];

const TIPO_PERSONA = [
  { value: 'natural', label: 'Natural' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'acfc', label: 'ACFC' },
  { value: 'comunidad_etnica', label: 'Comunidad Étnica' },
];

const ESTRATOS = [
  { value: 'campesino', label: 'Campesino' },
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
];

const RATINGS = [
  { value: 0, label: 'Cualquiera' },
  { value: 3, label: '3+ estrellas' },
  { value: 4, label: '4+ estrellas' },
  { value: 4.5, label: '4.5+ estrellas' },
];

function CollapsibleSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100">
      <button onClick={onToggle} className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
        <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function ExplorarPage() {
  const [search, setSearch] = useState('');
  const [productoSearch, setProductoSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [tipoPersona, setTipoPersona] = useState('');
  const [estrato, setEstrato] = useState('');
  const [calificacionMin, setCalificacionMin] = useState(0);
  const [ubicacion, setUbicacion] = useState<{ departamento?: string; municipio?: string }>({});
  const [selected, setSelected] = useState<ProductorMapa | null>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    producto: true,
    ubicacion: false,
    productor: false,
  });

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set('q', search);
    if (productoSearch) p.set('producto', productoSearch);
    selectedCats.forEach((c) => p.append('categorias', c));
    if (ubicacion.departamento) p.set('codigoDepartamento', ubicacion.departamento);
    if (ubicacion.municipio) p.set('codigoMunicipio', ubicacion.municipio);
    if (tipoPersona) p.set('tipoPersona', tipoPersona);
    if (estrato) p.set('estrato', estrato);
    if (calificacionMin > 0) p.set('calificacionMin', String(calificacionMin));
    return p.toString();
  }, [search, productoSearch, selectedCats, ubicacion, tipoPersona, estrato, calificacionMin]);

  const { data, isLoading } = useApiGet<ProductorMapa[]>(`/rupl/mapa?${params}`);
  const productores = Array.isArray(data) ? data : [];

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasActiveFilters = search || productoSearch || selectedCats.length > 0 || ubicacion.departamento || tipoPersona || estrato || calificacionMin > 0;

  const clearFilters = () => {
    setSearch('');
    setProductoSearch('');
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

  const [showMobileList, setShowMobileList] = useState(true);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      <div className="flex gap-2 lg:hidden">
        <button
          onClick={() => setShowMobileList(true)}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', showMobileList ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600')}
        >
          Lista
        </button>
        <button
          onClick={() => setShowMobileList(false)}
          className={cn('flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', !showMobileList ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600')}
        >
          Mapa
        </button>
      </div>

      <div className={cn(
        'flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        'w-full lg:w-80',
        'lg:flex',
        showMobileList ? 'flex' : 'hidden lg:flex'
      )}>
        {/* Search */}
        <div className="border-b border-slate-100 p-3">
          <div className="relative">
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Product filters */}
        <CollapsibleSection title="Producto" open={openSections.producto} onToggle={() => toggleSection('producto')}>
          <input
            type="text"
            placeholder="Buscar por nombre de producto…"
            value={productoSearch}
            onChange={(e) => setProductoSearch(e.target.value)}
            className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="flex flex-wrap gap-1">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
                  selectedCats.includes(cat)
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Location filters */}
        <CollapsibleSection title="Ubicación" open={openSections.ubicacion} onToggle={() => toggleSection('ubicacion')}>
          <LocationFilter
            compact
            value={ubicacion}
            onChange={(v) => setUbicacion({ departamento: v.departamento, municipio: v.municipio })}
          />
        </CollapsibleSection>

        {/* Producer filters */}
        <CollapsibleSection title="Productor" open={openSections.productor} onToggle={() => toggleSection('productor')}>
          <div className="space-y-2">
            <select
              value={tipoPersona}
              onChange={(e) => setTipoPersona(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Tipo de productor</option>
              {TIPO_PERSONA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select
              value={estrato}
              onChange={(e) => setEstrato(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Estrato</option>
              {ESTRATOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
            <select
              value={calificacionMin}
              onChange={(e) => setCalificacionMin(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </CollapsibleSection>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="mx-3 my-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50">
            Limpiar filtros
          </button>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto border-t border-slate-100">
          {isLoading ? (
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
                className={cn(
                  'w-full border-b border-slate-50 p-3 text-left transition-colors hover:bg-primary/10',
                  selected?.id === p.id ? 'bg-primary/10 ring-1 ring-primary/20' : ''
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{p.razonSocial}</p>
                  {p.tipoPersona && (
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
                      {p.tipoPersona.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                {p.nombreComercial && (
                  <p className="text-xs text-slate-400">✨ {p.nombreComercial}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={Number(p.calificacionPromedio)} size="sm" />
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                    p.estado === 'activo'
                      ? 'bg-green-100 text-green-700'
                      : p.estado === 'en_acreditacion'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-500'
                  )}>
                    {p.estado.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.productos.slice(0, 3).map((prod) => (
                    <span key={prod.id} className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {prod.nombre}
                      {prod.precioReferencia ? ` $${prod.precioReferencia}` : ''}
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
