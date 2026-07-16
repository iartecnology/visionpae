'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  estacionalidad?: Record<string, any>;
}

type SemanaData = { disponible: boolean; volumen: number };

function semanaLabel(s: number) {
  const start = new Date(2026, 0, 1 + (s - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
  return `${fmt(start)}-${fmt(end)}`;
}

const MESES = [
  { label: 'Ene', semanas: [1, 2, 3, 4] },
  { label: 'Feb', semanas: [5, 6, 7, 8] },
  { label: 'Mar', semanas: [9, 10, 11, 12] },
  { label: 'Abr', semanas: [13, 14, 15, 16] },
  { label: 'May', semanas: [17, 18, 19, 20] },
  { label: 'Jun', semanas: [21, 22, 23, 24, 25, 26] },
  { label: 'Jul', semanas: [26, 27, 28, 29, 30] },
  { label: 'Ago', semanas: [31, 32, 33, 34, 35] },
  { label: 'Sep', semanas: [36, 37, 38, 39] },
  { label: 'Oct', semanas: [40, 41, 42, 43] },
  { label: 'Nov', semanas: [44, 45, 46, 47] },
  { label: 'Dic', semanas: [48, 49, 50, 51, 52] },
];

export default function EstacionalidadPage() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [semanas, setSemanas] = useState<Record<number, SemanaData>>({});

  useEffect(() => {
    (async () => {
      try {
        const prod: any = await api.get(`/rupl/productores/${params.id}`);
        const p = prod.productos?.find((x: any) => x.id === params.prodId);
        if (p) {
          setProducto(p);
          const existing = p.estacionalidad?.semanas || {};
          const init: Record<number, SemanaData> = {};
          for (let i = 1; i <= 52; i++) {
            init[i] = existing[i] || { disponible: false, volumen: 0 };
          }
          setSemanas(init);
        }
      } catch { setError('Error al cargar'); }
      finally { setLoading(false); }
    })();
  }, [params.id, params.prodId]);

  const toggle = (s: number) => {
    setSemanas((prev) => ({
      ...prev,
      [s]: { ...prev[s], disponible: !prev[s].disponible },
    }));
  };

  const setVolumen = (s: number, v: string) => {
    setSemanas((prev) => ({
      ...prev,
      [s]: { ...prev[s], volumen: parseFloat(v) || 0 },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/rupl/productores/${params.id}/productos/${params.prodId}`, {
        estacionalidad: { semanas },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch { setError('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;
  if (!producto) return <div className="rounded-xl border bg-white py-12 text-center text-sm text-red-500 shadow-sm">Producto no encontrado</div>;

  const activas = Object.values(semanas).filter((s) => s.disponible).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📅 Disponibilidad Estacional</h1>
          <p className="mt-1 text-sm text-slate-500">
            {producto.nombre} · {activas}/52 semanas activas
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Volver</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Disponibilidad guardada</div>}

      <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">Semanas del Año</CardTitle>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => { const n: Record<number, SemanaData> = {}; for (let i = 1; i <= 52; i++) n[i] = { disponible: true, volumen: 0 }; setSemanas(n); }} className="rounded bg-emerald-100 px-2 py-1 text-emerald-700 hover:bg-emerald-200">Todo</button>
              <button type="button" onClick={() => { const n: Record<number, SemanaData> = {}; for (let i = 1; i <= 52; i++) n[i] = { disponible: false, volumen: 0 }; setSemanas(n); }} className="rounded bg-slate-100 px-2 py-1 text-slate-600 hover:bg-slate-200">Ninguno</button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {MESES.map((mes) => (
              <div key={mes.label}>
                <h3 className="mb-2 text-xs font-semibold text-slate-500">{mes.label}</h3>
                <div className="space-y-1.5">
                  {mes.semanas.map((s) => (
                    <div
                      key={s}
                      className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors ${
                        semanas[s]?.disponible
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-slate-100 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={semanas[s]?.disponible || false}
                        onChange={() => toggle(s)}
                        className="h-3 w-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="w-5 text-slate-500">S{s}</span>
                      {semanas[s]?.disponible && (
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={semanas[s]?.volumen || ''}
                          onChange={(e) => setVolumen(s, e.target.value)}
                          placeholder="vol"
                          className="w-12 rounded border border-slate-200 px-1 py-0.5 text-right text-[10px] focus:border-emerald-400 focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Disponibilidad'}</Button>
      </div>
    </div>
  );
}
