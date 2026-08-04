'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, cn, statusColor, statusLabel } from '@/lib/utils';
import { Badge } from '@/components/badge';
import { Table } from '@/components/table';
import { Pagination } from '@/components/pagination';
import { LocationFilter } from '@/components/location-filter';

interface Productor {
  id: string;
  razonSocial: string;
  numeroDocumento: string;
  tipoPersona: string;
  codigoMunicipio: string;
  estado: string;
  createdAt: string;
  productos?: unknown[];
}

interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

const tipoPersonaOptions = [
  { value: '', label: 'Todos' },
  { value: 'natural', label: 'Natural' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'acfc', label: 'ACFC' },
  { value: 'comunidad_etnica', label: 'Comunidad Étnica' },
];

const estadoOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'en_acreditacion', label: 'En Acreditación' },
  { value: 'vencido', label: 'Vencido' },
];

const tipoMap: Record<string, string> = { natural: 'Natural', asociacion: 'Asociación', acfc: 'ACFC', comunidad_etnica: 'Com. Étnica' };

const columns = [
  { key: 'razonSocial', label: 'Razón Social' },
  { key: 'numeroDocumento', label: 'Documento' },
  { key: 'tipoPersona', label: 'Tipo', render: (p: Productor) => tipoMap[p.tipoPersona] || p.tipoPersona },
  { key: 'codigoMunicipio', label: 'Municipio' },
  { key: 'estado', label: 'Estado', render: (p: Productor) => <Badge status={p.estado} /> },
  { key: 'createdAt', label: 'Registro', render: (p: Productor) => formatDate(p.createdAt) },
];

export default function RuplPage() {
  const router = useRouter();
  const [data, setData] = useState<Productor[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ page: 1, limit: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [ubicacion, setUbicacion] = useState<{ pais?: string; departamento?: string; municipio?: string; vereda?: string }>({});
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('q', search);
      if (tipoFilter) params.set('tipoPersona', tipoFilter);
      if (estadoFilter) params.set('estado', estadoFilter);
      if (ubicacion.departamento) params.set('codigoDepartamento', ubicacion.departamento);
      if (ubicacion.municipio) params.set('codigoMunicipio', ubicacion.municipio);
      if (ubicacion.vereda) params.set('codigoVereda', ubicacion.vereda);

      const res = await api.get<{ data: Productor[]; meta: PageMeta }>(`/rupl/productores?${params}`);
      setData(res.data);
      setMeta(res.meta);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, tipoFilter, estadoFilter, ubicacion]);

  useEffect(() => { fetchData(1); }, []);

  const handleSearch = () => fetchData(1);

  const hasActiveFilters = !!(search || tipoFilter || estadoFilter || ubicacion.departamento);
  const activeFilterCount = (search ? 1 : 0) + (tipoFilter ? 1 : 0) + (estadoFilter ? 1 : 0) + (ubicacion.departamento ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setTipoFilter('');
    setEstadoFilter('');
    setUbicacion({});
  };

  const activeFilterChips = (() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (search) chips.push({ label: `"${search}"`, onRemove: () => setSearch('') });
    if (tipoFilter) {
      const opt = tipoPersonaOptions.find((o) => o.value === tipoFilter);
      if (opt) chips.push({ label: opt.label, onRemove: () => setTipoFilter('') });
    }
    if (estadoFilter) {
      const opt = estadoOptions.find((o) => o.value === estadoFilter);
      if (opt) chips.push({ label: opt.label, onRemove: () => setEstadoFilter('') });
    }
    if (ubicacion.departamento) chips.push({ label: '📍 Ubicación', onRemove: () => setUbicacion({}) });
    return chips;
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">👥 RUPL — Productores Locales</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Registro Único de Productores Locales</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/rupl/nuevo')}
          className="w-full rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800 sm:w-auto"
        >
          + Nuevo Productor
        </button>
      </div>

      {/* Desktop filters */}
      <div className="hidden flex-wrap items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] sm:flex">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar por razón social o documento..."
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          style={{ minWidth: 260 }}
        />
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500"
        >
          {tipoPersonaOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500"
        >
          {estadoOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <LocationFilter value={ubicacion} onChange={setUbicacion} />
        <button
          onClick={handleSearch}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          Filtrar
        </button>
      </div>

      {/* Mobile filter toggle */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
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

        {activeFilterChips.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
            <button onClick={() => { clearFilters(); handleSearch(); }} className="text-[11px] text-slate-400 hover:text-slate-600 ml-1">
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:block">
            <Table
              columns={columns}
              data={data}
              keyExtractor={(p) => p.id}
              onRowClick={(p) => router.push(`/dashboard/rupl/${p.id}`)}
            />
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {data.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
                No hay productores disponibles
              </div>
            ) : (
              data.map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/dashboard/rupl/${p.id}`)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{p.razonSocial}</p>
                    <span className={cn(
                      'shrink-0 rounded px-2 py-0.5 text-[10px] font-medium',
                      statusColor(p.estado)
                    )}>
                      {statusLabel(p.estado)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📄</span>
                      <span>{p.numeroDocumento}</span>
                      <span className="text-slate-300">·</span>
                      <span>{tipoMap[p.tipoPersona] || p.tipoPersona}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📍</span>
                      <span>{p.codigoMunicipio || '—'}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">{formatDate(p.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={fetchData} />
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
                <label className="mb-2 block text-xs font-medium text-slate-500">Buscar productor</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Razón social o documento..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Tipo de persona</label>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  {tipoPersonaOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Estado</label>
                <select
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  {estadoOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Ubicación</label>
                <LocationFilter
                  compact
                  value={ubicacion}
                  onChange={setUbicacion}
                />
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
              <button
                onClick={() => { handleSearch(); setShowMobileFilters(false); }}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                Ver {meta.total} resultado{meta.total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
