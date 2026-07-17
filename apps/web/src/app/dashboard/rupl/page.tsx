'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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

const columns = [
  { key: 'razonSocial', label: 'Razón Social' },
  { key: 'numeroDocumento', label: 'Documento' },
  {
    key: 'tipoPersona',
    label: 'Tipo',
    render: (p: Productor) => {
      const map: Record<string, string> = { natural: 'Natural', asociacion: 'Asociación', acfc: 'ACFC', comunidad_etnica: 'Com. Étnica' };
      return map[p.tipoPersona] || p.tipoPersona;
    },
  },
  { key: 'codigoMunicipio', label: 'Municipio' },
  {
    key: 'estado',
    label: 'Estado',
    render: (p: Productor) => <Badge status={p.estado} />,
  },
  {
    key: 'createdAt',
    label: 'Registro',
    render: (p: Productor) => formatDate(p.createdAt),
  },
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">👥 RUPL — Productores Locales</h1>
          <p className="mt-1 text-sm text-slate-500">Registro Único de Productores Locales</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/rupl/nuevo')}
          className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800"
        >
          + Nuevo Productor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)]">
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
          onChange={(e) => { setTipoFilter(e.target.value); }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500"
        >
          {tipoPersonaOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={estadoFilter}
          onChange={(e) => { setEstadoFilter(e.target.value); }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-emerald-500"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="en_acreditacion">En Acreditación</option>
          <option value="vencido">Vencido</option>
        </select>
        <LocationFilter value={ubicacion} onChange={setUbicacion} />
        <button
          onClick={handleSearch}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          Filtrar
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(p) => p.id}
            onRowClick={(p) => router.push(`/dashboard/rupl/${p.id}`)}
          />
          <Pagination page={meta.page} limit={meta.limit} total={meta.total} onPageChange={fetchData} />
        </div>
      )}
    </div>
  );
}
