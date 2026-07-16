'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const categoriaOptions = [
  'fruta', 'verdura', 'lacteo', 'carnes', 'granos',
  'panaderia', 'preparaciones', 'bebidas', 'huevos', 'tuberculos', 'otros',
];

export default function NuevaCertificacionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    contratoId: '',
    productoCategoria: 'fruta',
    volumenRequeridoMensual: 0,
    periodoInicio: '',
    periodoFin: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/certificaciones', form);
      router.push('/dashboard/certificaciones');
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
        <h1 className="text-xl font-semibold text-slate-800">Nueva Certificación de Insuficiencia</h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ID del Contrato Marco *</label>
          <input value={form.contratoId} onChange={(e) => set('contratoId', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Categoría de Producto *</label>
            <select value={form.productoCategoria} onChange={(e) => set('productoCategoria', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
              {categoriaOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Volumen Requerido (kg) *</label>
            <input type="number" value={form.volumenRequeridoMensual || ''} onChange={(e) => set('volumenRequeridoMensual', Number(e.target.value))} required min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Periodo Inicio *</label>
            <input type="date" value={form.periodoInicio} onChange={(e) => set('periodoInicio', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Periodo Fin *</label>
            <input type="date" value={form.periodoFin} onChange={(e) => set('periodoFin', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear Certificación'}
          </button>
        </div>
      </form>
    </div>
  );
}
