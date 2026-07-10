'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const PIE_COLORS = ['#059669', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

interface Resumen {
  totalProductores: number; totalOrdenes: number; totalRecetas: number; totalRuedas: number; ventasTotales: number;
}
interface Cumplimiento { contrato: string; porcentajeCumplimiento: number; presupuestoLocal: number; gastoLocal: number; gastoTotal: number }
interface ProductoresData { total: number; porTipo: { clave: string; count: number }[]; porEstado: { clave: string; count: number }[]; porEstrato: { clave: string; count: number }[] }
interface CompraTemporal { mes: string; local: number; externo: number; total: number }
interface Categoria { categoria: string; total: number; usos: number }

export default function ReportesPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cumplimiento, setCumplimiento] = useState<Cumplimiento[]>([]);
  const [productores, setProductores] = useState<ProductoresData | null>(null);
  const [temporal, setTemporal] = useState<CompraTemporal[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (desde) params.set('desde', desde);
      if (hasta) params.set('hasta', hasta);
      const qs = params.toString();

      const [r, c, p, t, cat] = await Promise.all([
        api.get<Resumen>('/reportes/resumen'),
        api.get<Cumplimiento[]>('/reportes/cumplimiento'),
        api.get<ProductoresData>('/reportes/productores'),
        api.get<CompraTemporal[]>(`/reportes/compras-temporal${qs ? '?' + qs : ''}`),
        api.get<Categoria[]>('/reportes/categorias'),
      ]);
      setResumen(r);
      setCumplimiento(c);
      setProductores(p);
      setTemporal(t);
      setCategorias(cat);
    } catch { setError('Error al cargar reportes'); }
  }, [desde, hasta]);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const exportCSV = () => {
    if (!cumplimiento.length) return;
    const headers = ['Contrato', 'Presupuesto Local', 'Gasto Local', 'Gasto Total', '% Cumplimiento'];
    const rows = cumplimiento.map((c) => [c.contrato, c.presupuestoLocal, c.gastoLocal, c.gastoTotal, c.porcentajeCumplimiento]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reporte-cumplimiento.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const cumplimientoColor = (pct: number) => {
    if (pct >= 40) return '#059669';
    if (pct >= 20) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📈 Reportes</h1>
          <p className="mt-1 text-sm text-slate-500">Datos agregados del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-500" />
            <span className="text-slate-400">—</span>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-emerald-500" />
          </div>
          <button onClick={exportCSV} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Exportar CSV</button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Productores" value={resumen?.totalProductores ?? 0} color="emerald" />
        <KpiCard label="Órdenes" value={resumen?.totalOrdenes ?? 0} color="blue" />
        <KpiCard label="Recetas" value={resumen?.totalRecetas ?? 0} color="amber" />
        <KpiCard label="Ruedas" value={resumen?.totalRuedas ?? 0} color="slate" />
        <KpiCard label="Ventas" value={formatCurrency(resumen?.ventasTotales ?? 0)} color="emerald" />
      </div>

      {temporal.length > 0 && (
        <ChartCard title="Compras por Mes">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={temporal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="local" name="Local" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="externo" name="Externo" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid grid-cols-2 gap-6">
        {categorias.length > 0 && (
          <ChartCard title="Productos por Categoría">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categorias} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                  {categorias.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {productores && (
          <ChartCard title="Productores por Tipo">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productores.porTipo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="clave" type="category" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Cantidad" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {cumplimiento.length > 0 && (
        <ChartCard title="Cumplimiento Ley 2046 por Contrato">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cumplimiento}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="contrato" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Bar dataKey="porcentajeCumplimiento" name="% Cumplimiento" radius={[4, 4, 0, 0]}>
                {cumplimiento.map((c, i) => <Cell key={i} fill={cumplimientoColor(c.porcentajeCumplimiento)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {productores && (
        <div className="grid grid-cols-2 gap-6">
          <ChartCard title="Por Estado">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={productores.porEstado} dataKey="count" nameKey="clave" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                  {productores.porEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Por Estrato">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={productores.porEstrato} dataKey="count" nameKey="clave" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                  {productores.porEstrato.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white',
    blue: 'border-blue-200/60 bg-gradient-to-br from-blue-50 to-white',
    amber: 'border-amber-200/60 bg-gradient-to-br from-amber-50 to-white',
    slate: 'border-slate-200/60 bg-gradient-to-br from-slate-50 to-white',
  };
  return (
    <div className={`rounded-xl border p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] ${colors[color]}`}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}
