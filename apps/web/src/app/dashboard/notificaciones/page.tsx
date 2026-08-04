'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  link?: string;
  fecha: string;
}

const iconMap: Record<string, string> = {
  alerta_cumplimiento: '📊',
  vencimiento_documento: '📄',
  oferta_rueda: '🤝',
  nueva_orden: '📝',
  incidencia: '⚠️',
  certificacion_resuelta: '📋',
  sistema: '🔔',
};

export default function NotificacionesPage() {
  const router = useRouter();
  const [data, setData] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'noLeidas'>('todas');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Notificacion[]>('/notificaciones');
      setData(Array.isArray(res) ? res : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClick = async (n: Notificacion) => {
    if (!n.leida) {
      await api.patch(`/notificaciones/${n.id}/leer`, {});
      setData((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    }
    if (n.link) router.push(n.link);
  };

  const displayData = filter === 'noLeidas' ? data.filter((n) => !n.leida) : data;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Notificaciones</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Historial de notificaciones del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('todas')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors sm:flex-initial ${filter === 'todas' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('noLeidas')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition-colors sm:flex-initial ${filter === 'noLeidas' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            No leídas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          {displayData.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No hay notificaciones</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayData.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 sm:gap-4 sm:px-6 sm:py-4 ${!n.leida ? 'bg-emerald-50/30' : ''}`}
                >
                  <span className="mt-0.5 text-lg">{iconMap[n.tipo] || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${n.leida ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>{n.titulo}</p>
                      {!n.leida && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{n.mensaje}</p>
                    <p className="mt-1 text-xs text-slate-300">{formatDate(n.fecha)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}