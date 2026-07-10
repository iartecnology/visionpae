'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const tipoOptions = [
  { value: 'calidad_insuficiente', label: 'Calidad Insuficiente' },
  { value: 'retraso_entrega', label: 'Retraso en Entrega' },
  { value: 'cantidad_incompleta', label: 'Cantidad Incompleta' },
  { value: 'producto_no_corresponde', label: 'Producto no Corresponde' },
  { value: 'empaque_inadecuado', label: 'Empaque Inadecuado' },
  { value: 'otra', label: 'Otra' },
];

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ordenId: '',
    tipo: 'calidad_insuficiente',
    descripcion: '',
    latitud: '',
    longitud: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/incidencias', {
        ...form,
        latitud: form.latitud ? Number(form.latitud) : undefined,
        longitud: form.longitud ? Number(form.longitud) : undefined,
      });
      router.push('/dashboard/incidencias');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
        <h1 className="text-xl font-semibold text-slate-800">Nueva Incidencia de Campo</h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ID de la Orden *</label>
          <input value={form.ordenId} onChange={(e) => set('ordenId', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de Incidencia *</label>
          <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
            {tipoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Descripción *</label>
          <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} required rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Latitud</label>
            <input type="number" step="any" value={form.latitud} onChange={(e) => set('latitud', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Longitud</label>
            <input type="number" step="any" value={form.longitud} onChange={(e) => set('longitud', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear Incidencia'}
          </button>
        </div>
      </form>
    </div>
  );
}
