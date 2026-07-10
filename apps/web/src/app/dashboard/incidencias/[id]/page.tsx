'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface IncidenciaDetail {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  fotoUrls: string[];
  latitud?: number;
  longitud?: number;
  fechaReporte: string;
  fechaResolucion?: string;
  resolucion?: string;
  orden: { numero: string; valorTotal: number; productor: { razonSocial: string } };
  reportado: { nombreCompleto: string };
  resuelto?: { nombreCompleto: string };
}

const estados = ['abierta', 'en_gestion', 'resuelta', 'cerrada'];

export default function IncidenciaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [inc, setInc] = useState<IncidenciaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [resolucion, setResolucion] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get<IncidenciaDetail>(`/incidencias/${params.id}`);
      setInc(res);
      setNuevoEstado(res.estado);
    } catch {
      setInc(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const handleResolver = async () => {
    if (!nuevoEstado || nuevoEstado === inc?.estado) return;
    setSaving(true);
    try {
      await api.patch(`/incidencias/${params.id}/resolver`, {
        estado: nuevoEstado,
        resolucion,
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando...</div>;
  if (!inc) return <div className="py-20 text-center text-sm text-red-500">Incidencia no encontrada</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
        <h1 className="text-xl font-semibold text-slate-800">Incidencia</h1>
        <Badge status={inc.estado} />
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Información General</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Tipo</dt><dd className="font-medium capitalize text-slate-800">{inc.tipo.replace(/_/g, ' ')}</dd></div>
          <div><dt className="text-slate-400">Orden</dt><dd className="font-medium text-slate-800">#{inc.orden.numero}</dd></div>
          <div><dt className="text-slate-400">Productor</dt><dd className="font-medium text-slate-800">{inc.orden.productor.razonSocial}</dd></div>
          <div><dt className="text-slate-400">Reportado por</dt><dd className="font-medium text-slate-800">{inc.reportado.nombreCompleto}</dd></div>
          <div><dt className="text-slate-400">Fecha Reporte</dt><dd className="font-medium text-slate-800">{formatDate(inc.fechaReporte)}</dd></div>
          {inc.fechaResolucion && <div><dt className="text-slate-400">Fecha Resolución</dt><dd className="font-medium text-slate-800">{formatDate(inc.fechaResolucion)}</dd></div>}
          {inc.resuelto && <div><dt className="text-slate-400">Resuelto por</dt><dd className="font-medium text-slate-800">{inc.resuelto.nombreCompleto}</dd></div>}
          {(inc.latitud && inc.longitud) ? (
            <div><dt className="text-slate-400">Ubicación</dt><dd className="font-medium text-slate-800">{inc.latitud}, {inc.longitud}</dd></div>
          ) : null}
        </dl>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Descripción</h2>
        <p className="text-sm text-slate-700">{inc.descripcion}</p>
      </div>

      {inc.resolucion && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Resolución</h2>
          <p className="text-sm text-slate-700">{inc.resolucion}</p>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Actualizar Estado</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-slate-500">Nuevo Estado</label>
            <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
              {estados.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="flex-[2]">
            <label className="mb-1 block text-xs text-slate-500">Resolución (opcional)</label>
            <input value={resolucion} onChange={(e) => setResolucion(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <button
            onClick={handleResolver}
            disabled={saving || nuevoEstado === inc.estado}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? '...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
