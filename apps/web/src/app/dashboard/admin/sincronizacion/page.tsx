'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface SyncBatch {
  id: string;
  dispositivoId: string;
  tipoDispositivo: string;
  ultimoSyncPull: string | null;
  ultimoSyncPush: string | null;
  cambiosPendientes: number;
  estado: string;
  modelosSincronizados: string[];
  user: { nombreCompleto: string; email: string };
}

export default function AdminSincronizacionPage() {
  const [data, setData] = useState<SyncBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<SyncBatch[]>('/sincronizacion');
      setData(Array.isArray(res) ? res : []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); const iv = setInterval(fetchData, 10000); return () => clearInterval(iv); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Sincronización Móvil</h1>
          <p className="mt-1 text-sm text-slate-500">Monitoreo de dispositivos y estado de sincronización offline</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="grid gap-4">
          {data.map((batch) => (
            <div key={batch.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{batch.dispositivoId}</span>
                    <Badge status={batch.estado} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {batch.user.nombreCompleto} · {batch.tipoDispositivo}
                  </p>
                </div>
                {batch.cambiosPendientes > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {batch.cambiosPendientes} pendientes
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
                <div>
                  <span className="text-slate-400">Último sync pull:</span>
                  <br />
                  {batch.ultimoSyncPull ? formatDate(batch.ultimoSyncPull) : '—'}
                </div>
                <div>
                  <span className="text-slate-400">Último sync push:</span>
                  <br />
                  {batch.ultimoSyncPush ? formatDate(batch.ultimoSyncPush) : '—'}
                </div>
              </div>

              {batch.modelosSincronizados.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {batch.modelosSincronizados.map((m) => (
                    <span key={m} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{m}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {data.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
              No hay dispositivos registrados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
