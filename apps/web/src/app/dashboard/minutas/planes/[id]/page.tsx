'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { formatDate } from '@/lib/utils';

interface PlanItem { id: string; recetaId: string; receta?: { nombre: string }; diaSemana: number; tipoComida: string; porcionesEstimadas: number; }
interface PlanSemanal {
  id: string; nombre: string; fechaInicio: string; fechaFin: string; estado: string;
  observaciones?: string; createdAt: string; items: PlanItem[];
}

const dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const comidaLabel: Record<string, string> = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', refrigerio: 'Refrigerio' };

export default function PlanDetailPage() {
  const params = useParams(); const router = useRouter();
  const [plan, setPlan] = useState<PlanSemanal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PlanSemanal>(`/planes-semanales/${params.id}`).then(setPlan).catch(() => setPlan(null)).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;
  if (!plan) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-red-500 shadow-sm">Plan no encontrado</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
          <h1 className="text-xl font-semibold text-slate-800">{plan.nombre}</h1>
          <Badge status={plan.estado} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Período</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(plan.fechaInicio)} — {formatDate(plan.fechaFin)}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Items</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{plan.items?.length || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Estado</p>
          <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">{plan.estado}</p>
        </div>
      </div>

      {plan.observaciones && (
        <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Observaciones</h2>
          <p className="text-sm text-slate-600">{plan.observaciones}</p>
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Menú Semanal</h2>
        {(!plan.items || plan.items.length === 0) ? (
          <p className="text-sm text-slate-400">No hay items en este plan</p>
        ) : (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((dia) => {
              const items = plan.items.filter((i) => i.diaSemana === dia);
              if (items.length === 0) return null;
              return (
                <div key={dia}>
                  <h3 className="mb-2 text-xs font-semibold text-slate-500">{dias[dia]}</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                        <p className="text-xs font-medium text-slate-700">{item.receta?.nombre || 'Receta'}</p>
                        <p className="text-[10px] text-slate-400">{comidaLabel[item.tipoComida] || item.tipoComida} · {item.porcionesEstimadas} porc.</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
