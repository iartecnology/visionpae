'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';

interface ContratoDetail {
  id: string;
  numero: string;
  objeto: string;
  valorTotal: number;
  presupuestoComprasLocales: number;
  tipo: string;
  estado: string;
  periodoInicio: string;
  periodoFin: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  ordenes: any[];
  _count: { ordenes: number };
}

const tipoLabel: Record<string, string> = {
  anual: 'Anual', semestral: 'Semestral', trimestral: 'Trimestral',
};

export default function ContratoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contrato, setContrato] = useState<ContratoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ContratoDetail>(`/compras/contratos/${params.id}`);
      setContrato(res);
    } catch {
      setContrato(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando...</div>;
  if (!contrato) return <div className="py-20 text-center text-sm text-red-500">Contrato no encontrado</div>;

  const localPercent = contrato.valorTotal > 0
    ? ((contrato.presupuestoComprasLocales / contrato.valorTotal) * 100).toFixed(1)
    : '0';

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
          <h1 className="text-xl font-semibold text-slate-800">Contrato {contrato.numero}</h1>
          <Badge status={contrato.estado} />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{tipoLabel[contrato.tipo] || contrato.tipo}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/compras?contratoId=${contrato.id}`}>
            <Button variant="outline" size="sm">Ver Órdenes</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Valor Total</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{formatCurrency(contrato.valorTotal)}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Presupuesto Local</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{formatCurrency(contrato.presupuestoComprasLocales)}</p>
          <p className="text-xs text-slate-400">{localPercent}% del total</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Órdenes</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{contrato._count?.ordenes || 0}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Información General</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Objeto</dt><dd className="font-medium text-slate-800 col-span-2">{contrato.objeto}</dd></div>
          <div><dt className="text-slate-400">Período</dt><dd className="font-medium text-slate-800">{formatDate(contrato.periodoInicio)} — {formatDate(contrato.periodoFin)}</dd></div>
          <div><dt className="text-slate-400">Creado</dt><dd className="font-medium text-slate-800">{formatDate(contrato.createdAt)}</dd></div>
          <div><dt className="text-slate-400">Actualizado</dt><dd className="font-medium text-slate-800">{formatDate(contrato.updatedAt)}</dd></div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Órdenes de Compra</h2>
          <Link href={`/dashboard/compras/nueva?contratoId=${contrato.id}`}>
            <Button size="sm">+ Nueva Orden</Button>
          </Link>
        </div>
        {(!contrato.ordenes || contrato.ordenes.length === 0) ? (
          <p className="text-sm text-slate-400">No hay órdenes asociadas a este contrato</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {contrato.ordenes.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/dashboard/compras/${o.id}`} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    {o.numero}
                  </Link>
                  <p className="text-xs text-slate-400">{o.productor?.razonSocial || '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{formatCurrency(o.valorTotal)}</span>
                  <Badge status={o.estado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
