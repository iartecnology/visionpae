'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const [productores, contratos] = await Promise.allSettled([
          api.get<any>('/rupl/productores?limit=1'),
          api.get<any[]>('/compras/contratos'),
        ]);

        const prodRes = productores.status === 'fulfilled' ? productores.value : null;
        let cumplimiento: any = null;

        if (contratos.status === 'fulfilled' && contratos.value.length > 0) {
          const contratoId = contratos.value[0].id;
          const cumRes = await api.get<any>(`/compras/cumplimiento/${contratoId}`).catch(() => null);
          cumplimiento = cumRes?.cumplimiento ?? null;
        }

        setStats({
          totalProductores: prodRes?.meta?.total ?? '—',
          cumplimiento,
        });
      } catch {
        setStats(null);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">📊 Panel Principal</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen de operaciones PAE del municipio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white shadow-[0_4px_16px_-8px_rgba(5,150,105,0.12)]">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-emerald-700">% Cumplimiento Local</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold text-emerald-800">{stats?.cumplimiento ? `${stats.cumplimiento.porcentaje}%` : '—'}</p>
            <p className="mt-0.5 text-xs text-emerald-600">Meta mínima 30%</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200/60 bg-gradient-to-br from-blue-50 to-white shadow-[0_4px_16px_-8px_rgba(59,130,246,0.12)]">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-blue-700">Gasto en Compras Locales</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold text-blue-800">{stats?.cumplimiento ? formatCurrency(stats.cumplimiento.gastoLocal) : '—'}</p>
            <p className="mt-0.5 text-xs text-blue-600">Del presupuesto total</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50 to-white shadow-[0_4px_16px_-8px_rgba(217,119,6,0.12)]">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-amber-700">Productores Activos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold text-amber-800">{stats?.totalProductores ?? '—'}</p>
            <p className="mt-0.5 text-xs text-amber-600">En el RUPL</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50 to-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.08)]">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-slate-700">Órdenes del Mes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <p className="text-2xl font-bold text-slate-800">—</p>
            <p className="mt-0.5 text-xs text-slate-600">Pendientes por emitir</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Evolución % Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex h-60 items-center justify-center rounded-lg bg-slate-50/50 text-sm text-slate-400">
              {stats?.cumplimiento
                ? `Cumplimiento actual: ${stats.cumplimiento.porcentaje}% (Meta: ${stats.cumplimiento.meta}%)`
                : 'Conecta la API para ver los datos'}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Composición de Compras</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex h-60 items-center justify-center rounded-lg bg-slate-50/50 text-sm text-slate-400">
              {stats?.cumplimiento
                ? `${formatCurrency(stats.cumplimiento.gastoLocal)} local / ${formatCurrency(stats.cumplimiento.gastoTotal)} total`
                : 'Conecta la API para ver los datos'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
