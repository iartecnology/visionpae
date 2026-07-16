'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface CumplimientoData {
  contrato: { numero: string; valorTotal: number; presupuestoLocal: number };
  cumplimiento: { porcentaje: number; meta: number; delta: number; gastoTotal: number; gastoLocal: number; estado: string };
  totalOrdenes: number;
}

interface SimulacionResult {
  actual: { porcentaje: number; estado: string };
  simulado: { porcentaje: number; estado: string };
  impacto: number;
}

export default function CumplimientoPage() {
  const [data, setData] = useState<CumplimientoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [contratoId, setContratoId] = useState('');

  // simulacion
  const [sim, setSim] = useState({ productorId: '', valorTotal: 0, esLocal: true });
  const [simResult, setSimResult] = useState<SimulacionResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const load = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get<CumplimientoData>(`/compras/cumplimiento/${id}`);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (contratoId) load(contratoId); }, [contratoId]);

  const handleSimular = async () => {
    if (!contratoId) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await api.post<SimulacionResult>(`/compras/${contratoId}/simular`, {
        productorId: sim.productorId,
        valorTotal: sim.valorTotal,
        esLocal: sim.esLocal,
      });
      setSimResult(res);
    } catch {
      setSimResult(null);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Cumplimiento Ley 2046</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitoreo del porcentaje de compras locales (meta mínima 30%)
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Contrato Marco</label>
        <div className="flex gap-3">
          <input
            value={contratoId}
            onChange={(e) => setContratoId(e.target.value)}
            placeholder="ID del contrato..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => load(contratoId)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Consultar
          </button>
        </div>
      </div>

      {loading && <div className="py-10 text-center text-sm text-slate-400">Cargando...</div>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="% Cumplimiento" value={`${data.cumplimiento.porcentaje}%`} color={data.cumplimiento.porcentaje >= data.cumplimiento.meta ? 'emerald' : 'red'} />
            <MetricCard label="Meta" value={`${data.cumplimiento.meta}%`} color="slate" />
            <MetricCard label="Gasto Local" value={formatCurrency(data.cumplimiento.gastoLocal)} color="blue" />
            <MetricCard label="Gasto Total" value={formatCurrency(data.cumplimiento.gastoTotal)} color="slate" />
          </div>

          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Contrato {data.contrato.numero}</p>
                <p className="text-xs text-slate-400">{data.totalOrdenes} órdenes emitidas</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">
                  Presupuesto local: {formatCurrency(data.contrato.presupuestoLocal)}
                </p>
                <p className="text-xs text-slate-400">
                  Delta para cumplir: {data.cumplimiento.delta > 0 ? `Faltan ${formatCurrency(data.cumplimiento.delta)}` : 'Cumplido'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Simulador de Escenarios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Productor ID</label>
                <input
                  value={sim.productorId}
                  onChange={(e) => setSim((s) => ({ ...s, productorId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Valor de la Orden</label>
                <input
                  type="number"
                  value={sim.valorTotal || ''}
                  onChange={(e) => setSim((s) => ({ ...s, valorTotal: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sim.esLocal}
                    onChange={(e) => setSim((s) => ({ ...s, esLocal: e.target.checked }))}
                    className="rounded"
                  />
                  Compra Local
                </label>
                <button
                  onClick={handleSimular}
                  disabled={simLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {simLoading ? '...' : 'Simular'}
                </button>
              </div>
            </div>

            {simResult && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-400">Cumplimiento Actual</p>
                  <p className={`text-lg font-bold ${simResult.actual.porcentaje >= 30 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {simResult.actual.porcentaje}%
                  </p>
                  <p className="text-xs text-slate-400">{simResult.actual.estado}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Cumplimiento Simulado</p>
                  <p className={`text-lg font-bold ${simResult.simulado.porcentaje >= 30 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {simResult.simulado.porcentaje}%
                  </p>
                  <p className="text-xs text-slate-400">{simResult.simulado.estado}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Impacto</p>
                  <p className={`text-lg font-bold ${simResult.impacto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {simResult.impacto > 0 ? '+' : ''}{simResult.impacto}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color] || colors.slate}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
