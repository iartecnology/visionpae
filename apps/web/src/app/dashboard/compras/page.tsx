'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">📝 Órdenes de Compra</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Gestiona las órdenes de compra del PAE</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/compras/contratos">
            <Button variant="outline" className="w-full sm:w-auto">📋 Contratos</Button>
          </Link>
          <Link href="/dashboard/compras/cumplimiento">
            <Button variant="outline" className="w-full sm:w-auto">📊 Cumplimiento</Button>
          </Link>
          <Link href="/dashboard/compras/nueva">
            <Button className="w-full sm:w-auto">+ Nueva Orden</Button>
          </Link>
        </div>
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
              keyExtractor={(o) => o.id}
              onRowClick={(o) => router.push(`/dashboard/compras/${o.id}`)}
            />
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {data.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay órdenes registradas</div>
            ) : (
              data.map((o) => (
                <button
                  key={o.id}
                  onClick={() => router.push(`/dashboard/compras/${o.id}`)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white p-4 text-left shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{o.numero}</p>
                      <p className="text-xs text-slate-500">{o.productor?.razonSocial || '—'}</p>
                    </div>
                    <Badge status={o.estado} />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">💰</span>
                      <span>{formatCurrency(o.valorTotal)}</span>
                      <span className="text-slate-300">·</span>
                      <span>{o.esLocal ? 'Local' : 'Externo'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📅</span>
                      <span>{formatDate(o.fechaEmision)}</span>
                      <span className="text-slate-300">·</span>
                      <span>Entrega: {formatDate(o.fechaEntregaProgramada)}</span>
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