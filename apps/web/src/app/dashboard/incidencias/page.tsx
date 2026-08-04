'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface Incidencia {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  fechaReporte: string;
  orden: { numero: string; valorTotal: number };
  reportado: { nombreCompleto: string };
}

const columns = [
  {
    key: 'tipo',
    label: 'Tipo',
    render: (i: Incidencia) => (
      <span className="capitalize text-slate-800">{i.tipo.replace(/_/g, ' ')}</span>
    ),
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (i: Incidencia) => <Badge status={i.estado} />,
  },
  {
    key: 'orden',
    label: 'Orden',
    render: (i: Incidencia) => `#${i.orden.numero}`,
  },
  {
    key: 'descripcion',
    label: 'Descripción',
    render: (i: Incidencia) => (
      <span className="max-w-xs truncate text-slate-500">{i.descripcion}</span>
    ),
  },
  {
    key: 'reportado',
    label: 'Reportado por',
    render: (i: Incidencia) => (
      <span className="text-sm text-slate-500">{i.reportado.nombreCompleto}</span>
    ),
  },
  {
    key: 'fechaReporte',
    label: 'Fecha',
    render: (i: Incidencia) => (
      <span className="text-sm text-slate-400">{formatDate(i.fechaReporte)}</span>
    ),
  },
];

export default function IncidenciasPage() {
  const router = useRouter();
  const [data, setData] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Incidencia[]>('/incidencias');
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
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Incidencias de Campo</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Reportes de novedades en entregas</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/incidencias/nueva')}
          className="w-full rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800 sm:w-auto"
        >
          + Nueva Incidencia
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => router.push(`/dashboard/incidencias/${inc.id}`)}
                    className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">{col.render(inc)}</td>
                    ))}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">No hay incidencias registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {data.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay incidencias registradas</div>
            ) : (
              data.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => router.push(`/dashboard/incidencias/${inc.id}`)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="capitalize text-xs text-slate-500">{inc.tipo.replace(/_/g, ' ')}</span>
                      <p className="text-sm font-semibold text-slate-800">Orden #{inc.orden.numero}</p>
                    </div>
                    <Badge status={inc.estado} />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p className="text-slate-600 line-clamp-2">{inc.descripcion}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400">👤</span>
                      <span>{inc.reportado.nombreCompleto}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-400">{formatDate(inc.fechaReporte)}</span>
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