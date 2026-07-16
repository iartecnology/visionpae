'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Demanda { id: string; entidadNombre: string; entidadMunicipio?: string; productosRequeridos: any[]; }
interface Match { id: string; demandaId: string; productorId: string; productor?: { razonSocial: string }; productoMatch: string; volumenOfrecido: number; precioOfertado?: number; distanciaKm?: number; estado: string; }
interface Rueda {
  id: string; nombre: string; fecha: string; lugar: string; descripcion?: string;
  tipo: string; estado: string; createdAt: string;
  demandas?: Demanda[]; matches?: Match[];
}

export default function RuedaDetailPage() {
  const params = useParams(); const router = useRouter();
  const [rueda, setRueda] = useState<Rueda | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'demandas' | 'matches'>('info');

  useEffect(() => {
    api.get<Rueda>(`/ruedas/${params.id}`).then(setRueda).catch(() => setRueda(null)).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;
  if (!rueda) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-red-500 shadow-sm">Rueda no encontrada</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
          <h1 className="text-xl font-semibold text-slate-800">{rueda.nombre}</h1>
          <Badge status={rueda.estado} />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize">{rueda.tipo}</span>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(['info', 'demandas', 'matches'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'info' ? 'Información' : t === 'demandas' ? `Demandas (${rueda.demandas?.length || 0})` : `Matches (${rueda.matches?.length || 0})`}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3"><CardTitle className="text-sm font-semibold text-slate-700">Detalles</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><dt className="text-slate-400">Fecha</dt><dd className="font-medium text-slate-800">{formatDate(rueda.fecha)}</dd></div>
              <div><dt className="text-slate-400">Lugar</dt><dd className="font-medium text-slate-800">{rueda.lugar}</dd></div>
              <div><dt className="text-slate-400">Tipo</dt><dd className="font-medium text-slate-800 capitalize">{rueda.tipo}</dd></div>
              <div><dt className="text-slate-400">Estado</dt><dd className="font-medium text-slate-800 capitalize">{rueda.estado}</dd></div>
            </div>
            {rueda.descripcion && <div><dt className="text-slate-400">Descripción</dt><dd className="mt-1 text-slate-700">{rueda.descripcion}</dd></div>}
          </CardContent>
        </Card>
      )}

      {tab === 'demandas' && (
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3"><CardTitle className="text-sm font-semibold text-slate-700">Demandas de la Rueda</CardTitle></CardHeader>
          <CardContent className="pt-4">
            {(!rueda.demandas || rueda.demandas.length === 0) ? (
              <p className="text-sm text-slate-400">No hay demandas registradas</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {rueda.demandas.map((d) => (
                  <div key={d.id} className="py-3">
                    <p className="text-sm font-medium text-slate-800">{d.entidadNombre}</p>
                    <p className="text-xs text-slate-400">{d.entidadMunicipio || '—'}</p>
                    {d.productosRequeridos?.map((pr: any, i: number) => (
                      <span key={i} className="mr-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">{pr.producto || pr.nombre || 'Producto'}</span>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'matches' && (
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3"><CardTitle className="text-sm font-semibold text-slate-700">Matches</CardTitle></CardHeader>
          <CardContent className="pt-4">
            {(!rueda.matches || rueda.matches.length === 0) ? (
              <p className="text-sm text-slate-400">No hay matches registrados</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {rueda.matches.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.productoMatch}</p>
                      <p className="text-xs text-slate-400">{m.productor?.razonSocial || 'Productor'} · {m.volumenOfrecido} kg</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {m.precioOfertado && <span className="text-sm text-slate-600">{formatCurrency(m.precioOfertado)}</span>}
                      {m.distanciaKm && <span className="text-xs text-slate-400">{m.distanciaKm} km</span>}
                      <Badge status={m.estado} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
