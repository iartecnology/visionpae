'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { Badge } from '@/components/badge';
import { Table } from '@/components/table';
import { Pagination } from '@/components/pagination';

interface Certificacion {
  id: string;
  numeroExpediente: string;
  productoCategoria: string;
  volumenRequeridoMensual: number;
  estado: string;
  fechaSolicitud: string;
  periodoInicio: string;
  periodoFin: string;
  contrato: { numero: string };
  _count: { evidencias: number; referenciados: number };
}

const columns = [
  { key: 'numeroExpediente', label: 'Expediente' },
  {
    key: 'estado',
    label: 'Estado',
    render: (c: Certificacion) => <Badge status={c.estado} />,
  },
  { key: 'productoCategoria', label: 'Categoría' },
  {
    key: 'contrato',
    label: 'Contrato',
    render: (c: Certificacion) => c.contrato?.numero || '—',
  },
  {
    key: 'volumenRequeridoMensual',
    label: 'Vol. Mensual',
    render: (c: Certificacion) => `${c.volumenRequeridoMensual} kg`,
  },
  {
    key: 'fechaSolicitud',
    label: 'Solicitud',
    render: (c: Certificacion) => formatDate(c.fechaSolicitud),
  },
];

export default function CertificacionesPage() {
  const router = useRouter();
  const [data, setData] = useState<Certificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Certificacion[]>('/certificaciones');
      setData(Array.isArray(res) ? res : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">📋 Certificaciones de Insuficiencia</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Gestiona las certificaciones de oferta local insuficiente</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/certificaciones/nueva')}
          className="w-full rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800 sm:w-auto"
        >
          + Nueva Certificación
        </button>
      </div>

      {/* Mobile filter toggle */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMobileFilters(true)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
            'border-slate-200 text-slate-600'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </button>
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
              keyExtractor={(c) => c.id}
              onRowClick={(c) => router.push(`/dashboard/certificaciones/${c.id}`)}
            />
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {data.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay certificaciones registradas</div>
            ) : (
              data.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/dashboard/certificaciones/${c.id}`)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{c.numeroExpediente}</p>
                    <Badge status={c.estado} />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400">📦</span>
                      <span>{c.productoCategoria}</span>
                      <span className="text-slate-300">·</span>
                      <span>{c.volumenRequeridoMensual} kg</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400">📋</span>
                      <span>Contrato: {c.contrato?.numero || '—'}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">{formatDate(c.fechaSolicitud)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}