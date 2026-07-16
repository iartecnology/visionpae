'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useApiGet } from '@/lib/swr-api';

function adjustColor(hex: string, amount: number): string {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const PRESET_COLORS = [
  { name: 'Esmeralda', hex: '#065f46' },
  { name: 'Azul', hex: '#1e40af' },
  { name: 'Índigo', hex: '#4338ca' },
  { name: 'Violeta', hex: '#6d28d9' },
  { name: 'Rosado', hex: '#be185d' },
  { name: 'Rojo', hex: '#b91c1c' },
  { name: 'Naranja', hex: '#c2410c' },
  { name: 'Teal', hex: '#0f766e' },
  { name: 'Cian', hex: '#0e7490' },
];

interface FeatureFlag {
  flag: string;
  habilitado: boolean;
}

export default function ConfiguracionPage() {
  const { data: meData, mutate: refreshMe } = useApiGet<{
    user: { role: { id: string; codigo: string } | null };
    permissions: string[];
    tenant: { id: string; nombre: string; config: Record<string, unknown> };
  } | null>('/auth/me');

  const tenantId = meData?.tenant?.id;
  const config = meData?.tenant?.config ?? {};
  const permisos = meData?.permissions ?? [];
  const puedeEditar = permisos.includes('configuracion:editar');

  const [primaryColor, setPrimaryColor] = useState((config.primaryColor as string) || '#065f46');
  const [brandName, setBrandName] = useState((config.brandName as string) || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(true);
  const [togglingFlag, setTogglingFlag] = useState<string | null>(null);

  useEffect(() => {
    setPrimaryColor((config.primaryColor as string) || '#065f46');
    setBrandName((config.brandName as string) || '');
  }, [config]);

  useEffect(() => {
    api.get<FeatureFlag[]>('/feature-flags').then((d) => {
      setFlags(Array.isArray(d) ? d : []);
    }).catch(() => {}).finally(() => setFlagsLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    if (!tenantId || !puedeEditar) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.patch(`/admin/tenants/${tenantId}/config`, {
        primaryColor,
        brandName,
      });
      setSaved(true);
      refreshMe();
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  }, [tenantId, primaryColor, brandName, puedeEditar, refreshMe]);

  const toggleFlag = async (flag: string, current: boolean) => {
    setTogglingFlag(flag);
    try {
      await api.patch(`/feature-flags/${flag}`, { habilitado: !current });
      setFlags((prev) => prev.map((f) => (f.flag === flag ? { ...f, habilitado: !current } : f)));
    } catch { /* ignore */ }
    setTogglingFlag(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">Personaliza la apariencia y funcionalidades de tu entidad</p>
      </div>

      {/* Color & Branding */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Color Principal</h2>

        <div className="mb-6 flex flex-wrap gap-3">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => puedeEditar && setPrimaryColor(c.hex)}
              disabled={!puedeEditar}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`h-10 w-10 rounded-full shadow-md transition-all ${primaryColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[10px] text-slate-500">{c.name}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 mb-1">Color personalizado (hex)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => puedeEditar && setPrimaryColor(e.target.value)}
              disabled={!puedeEditar}
              className="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0.5"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => puedeEditar && setPrimaryColor(e.target.value)}
              disabled={!puedeEditar}
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="#065f46"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <div className="p-4 text-center text-sm text-slate-500">Preview</div>
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="h-8 w-8 rounded-full bg-white/30" />
            <span className="text-sm font-bold text-white">VisionPAE</span>
            <span className="ml-auto rounded bg-white/20 px-2 py-0.5 text-[10px] text-white/80">PAE</span>
          </div>
          <div className="flex gap-2 bg-slate-50 p-4">
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Botón primario
            </button>
            <button
              className="rounded-lg border px-4 py-2 text-sm font-medium shadow-sm"
              style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}15` }}
            >
              Botón secundario
            </button>
          </div>
        </div>

        {/* Brand name */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 mb-1">Nombre de la entidad</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => puedeEditar && setBrandName(e.target.value)}
            disabled={!puedeEditar}
            className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            placeholder="Ej: Municipio de Tunja"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!puedeEditar || saving}
          className="rounded-lg px-6 py-2 text-sm font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>

        {!puedeEditar && (
          <p className="mt-2 text-xs text-amber-600">No tienes permisos para editar la configuración</p>
        )}
      </div>

      {/* Feature Flags */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Módulos y Funcionalidades</h2>
        {flagsLoading ? (
          <div className="py-6 text-center text-sm text-slate-400">Cargando...</div>
        ) : flags.length === 0 ? (
          <p className="text-sm text-slate-400">No hay funcionalidades configurables disponibles</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {flags.map((f) => (
              <div key={f.flag} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-slate-700">
                  {f.flag.replace(/modulo_/g, 'Módulo ').replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => toggleFlag(f.flag, f.habilitado)}
                  disabled={togglingFlag === f.flag}
                  className={`relative h-6 w-11 rounded-full transition-colors ${f.habilitado ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${f.habilitado ? 'translate-x-5' : ''}`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
