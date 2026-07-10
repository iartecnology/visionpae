'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/badge';
import { Table } from '@/components/table';
import { Button } from '@/components/ui/button';

interface Contrato {
  id: string;
  numero: string;
  objeto: string;
  valorTotal: number;
  presupuestoComprasLocales: number;
  tipo: string;
  estado: string;
  periodoInicio: string;
  periodoFin: string;
  createdAt: string;
}

const columns = [
  { key: 'numero', label: 'N° Contrato' },
  { key: 'objeto', label: 'Objeto', render: (c: Contrato) => c.objeto?.length > 60 ? c.objeto.slice(0, 60) + '…' : c.objeto },
  {
    key: 'valorTotal',
    label: 'Valor Total',
    render: (c: Contrato) => formatCurrency(c.valorTotal),
  },
  {
    key: 'presupuestoComprasLocales',
    label: 'Presup. Local',
    render: (c: Contrato) => formatCurrency(c.presupuestoComprasLocales),
  },
  {
    key: 'periodo',
    label: 'Período',
    render: (c: Contrato) => `${formatDate(c.periodoInicio)} - ${formatDate(c.periodoFin)}`,
  },
  {
    key: 'tipo',
    label: 'Tipo',
    render: (c: Contrato) => (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{c.tipo}</span>
    ),
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (c: Contrato) => <Badge status={c.estado} />,
  },
];

export default function ContratosPage() {
  const router = useRouter();
  const [data, setData] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Contrato[]>('/compras/contratos');
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
          <h1 className="text-xl font-bold text-slate-800">📋 Contratos Marco</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona los contratos del PAE</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/compras">
            <Button variant="outline">Órdenes</Button>
          </Link>
          <Link href="/dashboard/compras/contratos/nuevo">
            <Button>+ Nuevo Contrato</Button>
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
            keyExtractor={(c) => c.id}
            onRowClick={(c) => router.push(`/dashboard/compras/contratos/${c.id}`)}
          />
        </div>
      )}
    </div>
  );
}
