'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Incidencias de Campo</h1>
          <p className="mt-1 text-sm text-slate-500">Reportes de novedades en entregas</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/incidencias/nueva')}
          className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800"
        >
          + Nueva Incidencia
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
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
      )}
    </div>
  );
}
