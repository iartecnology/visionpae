'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/badge';
import { formatDate } from '@/lib/utils';

interface Ingrediente { id: string; nombre: string; categoriaProducto: string; cantidad: number; unidad: string; opcional: boolean; sustitutoPosible?: string; }
interface Receta {
  id: string; nombre: string; categoriaComida: string; porciones: number;
  tiempoPreparacionMin: number; instrucciones: string; dificultad: string;
  temporadaRecomendada: number[]; etiquetaCultural: string[];
  activo: boolean; createdAt: string; ingredientes: Ingrediente[];
}

const comidaLabel: Record<string, string> = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', refrigerio: 'Refrigerio' };

export default function RecetaDetailPage() {
  const params = useParams(); const router = useRouter();
  const [receta, setReceta] = useState<Receta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Receta>(`/recetas/${params.id}`).then(setReceta).catch(() => setReceta(null)).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;
  if (!receta) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-red-500 shadow-sm">Receta no encontrada</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
          <h1 className="text-xl font-semibold text-slate-800">{receta.nombre}</h1>
          <Badge status={receta.activo ? 'activo' : 'inactivo'} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Tipo</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{comidaLabel[receta.categoriaComida] || receta.categoriaComida}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Porciones</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{receta.porciones}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Tiempo</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{receta.tiempoPreparacionMin} min</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-center shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <p className="text-xs text-slate-400">Dificultad</p>
          <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">{receta.dificultad}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Instrucciones</h2>
        <p className="whitespace-pre-wrap text-sm text-slate-600">{receta.instrucciones}</p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Ingredientes ({receta.ingredientes?.length || 0})</h2>
        {(!receta.ingredientes || receta.ingredientes.length === 0) ? (
          <p className="text-sm text-slate-400">Sin ingredientes registrados</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {receta.ingredientes.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{ing.nombre}</span>
                  {ing.opcional && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">Opcional</span>}
                  {ing.sustitutoPosible && <span className="text-xs text-slate-400">o {ing.sustitutoPosible}</span>}
                </div>
                <span className="text-sm text-slate-500">{ing.cantidad} {ing.unidad}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {receta.etiquetaCultural?.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Etiquetas Culturales</h2>
          <div className="flex flex-wrap gap-1.5">
            {receta.etiquetaCultural.map((t) => <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
