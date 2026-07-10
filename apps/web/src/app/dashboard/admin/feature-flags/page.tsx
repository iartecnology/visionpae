'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface FeatureFlag {
  flag: string;
  habilitado: boolean;
  config: Record<string, any> | null;
  updatedAt: string;
}

const flagLabels: Record<string, string> = {
  rupl: 'RUPL — Registro Único de Productores',
  compras: 'Compras y Contratos',
  certificaciones: 'Certificaciones de Insuficiencia',
  minutas: 'Minutas y Menús',
  ruedas: 'Ruedas de Negocio',
  incidencias: 'Incidencias de Campo',
  actas_recibo: 'Actas de Recibo',
  notificaciones: 'Notificaciones',
  reportes: 'Reportes y Dashboard',
  sincronizacion_movil: 'Sincronización Móvil Offline',
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      const data = await api.get<FeatureFlag[]>('/feature-flags');
      setFlags(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const toggle = async (flag: string, current: boolean) => {
    setToggling(flag);
    try {
      await api.patch(`/feature-flags/${flag}`, { habilitado: !current });
      setFlags((prev) => prev.map((f) => (f.flag === flag ? { ...f, habilitado: !current } : f)));
    } catch { /* ignore */ } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">Feature Flags</h1>
        <p className="mt-1 text-sm text-slate-500">Habilitar o deshabilitar módulos del sistema por entidad</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <div className="divide-y divide-slate-100">
            {flags.map((f) => (
              <div key={f.flag} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{flagLabels[f.flag] || f.flag}</p>
                  <p className="text-xs text-slate-400">{f.flag}</p>
                </div>
                <button
                  onClick={() => toggle(f.flag, f.habilitado)}
                  disabled={toggling === f.flag}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    f.habilitado ? 'bg-emerald-500' : 'bg-slate-300'
                  } ${toggling === f.flag ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      f.habilitado ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
            {flags.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                No hay feature flags configurados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
