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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">📋 Contratos Marco</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Gestiona los contratos del PAE</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/compras" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full">Órdenes</Button>
          </Link>
          <Link href="/dashboard/compras/contratos/nuevo" className="flex-1 sm:flex-initial">
            <Button className="w-full">+ Nuevo Contrato</Button>
          </Link>
        </div>
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
              onRowClick={(c) => router.push(`/dashboard/compras/contratos/${c.id}`)}
            />
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {data.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay contratos</div>
            ) : (
              data.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/dashboard/compras/contratos/${c.id}`)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{c.numero}</p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{c.objeto}</p>
                    </div>
                    <Badge status={c.estado} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-medium">{c.tipo}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">{formatCurrency(c.valorTotal)}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {formatDate(c.periodoInicio)} — {formatDate(c.periodoFin)}
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