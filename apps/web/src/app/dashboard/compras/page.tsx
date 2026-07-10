'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/badge';
import { Table } from '@/components/table';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';

interface Orden {
  id: string;
  numero: string;
  productor: { razonSocial: string; numeroDocumento: string };
  valorTotal: number;
  esLocal: boolean;
  estado: string;
  fechaEmision: string;
  fechaEntregaProgramada: string;
  items: unknown[];
}

const columns = [
  { key: 'numero', label: 'N° Orden' },
  {
    key: 'productor',
    label: 'Productor',
    render: (o: Orden) => o.productor?.razonSocial || '—',
  },
  {
    key: 'valorTotal',
    label: 'Valor',
    render: (o: Orden) => formatCurrency(o.valorTotal),
  },
  {
    key: 'esLocal',
    label: 'Local',
    render: (o: Orden) => (o.esLocal ? <span className="text-emerald-600">Sí</span> : <span className="text-slate-400">No</span>),
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (o: Orden) => <Badge status={o.estado} />,
  },
  {
    key: 'fechaEmision',
    label: 'Emisión',
    render: (o: Orden) => formatDate(o.fechaEmision),
  },
];

export default function ComprasPage() {
  const router = useRouter();
  const [data, setData] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const contratoId = new URLSearchParams(window.location.search).get('contratoId') || '';
      const path = contratoId ? `/compras/ordenes?contratoId=${contratoId}` : `/compras/ordenes`;
      const res = await api.get<Orden[]>(path);
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
          <h1 className="text-xl font-bold text-slate-800">📝 Órdenes de Compra</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona las órdenes de compra del PAE</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/compras/contratos">
            <Button variant="outline">📋 Contratos</Button>
          </Link>
          <Link href="/dashboard/compras/cumplimiento">
            <Button variant="outline">📊 Cumplimiento</Button>
          </Link>
          <Link href="/dashboard/compras/nueva">
            <Button>+ Nueva Orden</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <Table
            columns={columns}
            data={data}
            keyExtractor={(o) => o.id}
            onRowClick={(o) => router.push(`/dashboard/compras/${o.id}`)}
          />
        </div>
      )}
    </div>
  );
}
