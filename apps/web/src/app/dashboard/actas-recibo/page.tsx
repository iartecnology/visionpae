'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface Acta {
  id: string;
  estado: string;
  fechaVisita: string;
  orden: { numero: string; valorTotal: number };
  productor: { razonSocial: string };
  interventor: { nombreCompleto: string };
}

const columns = [
  {
    key: 'estado',
    label: 'Estado',
    render: (a: Acta) => <Badge status={a.estado} />,
  },
  {
    key: 'orden',
    label: 'Orden',
    render: (a: Acta) => `#${a.orden.numero}`,
  },
  {
    key: 'productor',
    label: 'Productor',
    render: (a: Acta) => <span className="text-slate-800">{a.productor.razonSocial}</span>,
  },
  {
    key: 'interventor',
    label: 'Interventor',
    render: (a: Acta) => <span className="text-slate-500">{a.interventor.nombreCompleto}</span>,
  },
  {
    key: 'fechaVisita',
    label: 'Fecha Visita',
    render: (a: Acta) => <span className="text-sm text-slate-400">{formatDate(a.fechaVisita)}</span>,
  },
];

export default function ActasReciboPage() {
  const router = useRouter();
  const [data, setData] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Acta[]>('/actas-recibo');
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
          <h1 className="text-xl font-bold text-slate-800">Actas de Recibo</h1>
          <p className="mt-1 text-sm text-slate-500">Verificación de entregas en campo</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/actas-recibo/nueva')}
          className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800"
        >
          + Nueva Acta
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
              {data.map((acta) => (
                <tr
                  key={acta.id}
                  onClick={() => router.push(`/dashboard/actas-recibo/${acta.id}`)}
                  className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">{col.render(acta)}</td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-slate-400">No hay actas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
