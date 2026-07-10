'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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

const meta = { page: 1, limit: 20, total: 0 };

export default function CertificacionesPage() {
  const router = useRouter();
  const [data, setData] = useState<Certificacion[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📋 Certificaciones de Insuficiencia</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona las certificaciones de oferta local insuficiente</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/certificaciones/nueva')}
          className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-emerald-700 hover:to-emerald-800"
        >
          + Nueva Certificación
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => router.push(`/dashboard/certificaciones/${c.id}`)}
          />
        </div>
      )}
    </div>
  );
}
