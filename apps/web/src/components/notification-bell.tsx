'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetch = useCallback(async () => {
    try {
      const [lista, count] = await Promise.all([
        api.get<Notificacion[]>('/notificaciones'),
        api.get<number>('/notificaciones/no-leidas'),
      ]);
      setNotifs(Array.isArray(lista) ? lista : []);
      setNoLeidas(typeof count === 'number' ? count : 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); const iv = setInterval(fetch, 30000); return () => clearInterval(iv); }, [fetch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = async (n: Notificacion) => {
    if (!n.leida) {
      await api.patch(`/notificaciones/${n.id}/leer`, {});
      setNoLeidas((c) => Math.max(0, c - 1));
      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const markAllRead = async () => {
    await api.post('/notificaciones/leer-todas', {});
    setNoLeidas(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 transition-colors hover:bg-slate-100"
      >
        <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notificaciones</p>
            {noLeidas > 0 && (
              <button onClick={markAllRead} className="text-xs text-emerald-600 hover:text-emerald-700">
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Sin notificaciones</p>
            ) : (
              notifs.slice(0, 5).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!n.leida ? 'bg-emerald-50/50' : ''}`}
                >
                  <span className="mt-0.5 text-base">{iconMap[n.tipo] || '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${n.leida ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>{n.titulo}</p>
                    <p className="truncate text-xs text-slate-400">{n.mensaje}</p>
                    <p className="mt-0.5 text-[10px] text-slate-300">{formatDate(n.fecha)}</p>
                  </div>
                  {!n.leida && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                </button>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={() => { setOpen(false); router.push('/dashboard/notificaciones'); }}
              className="w-full rounded-lg px-3 py-2 text-center text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
