'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NuevaActaPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ordenId: '',
    fechaVisita: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/actas-recibo', form);
      router.push('/dashboard/actas-recibo');
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
        <h1 className="text-xl font-semibold text-slate-800">Nueva Acta de Recibo</h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ID de la Orden *</label>
          <input value={form.ordenId} onChange={(e) => set('ordenId', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha de Visita *</label>
          <input type="date" value={form.fechaVisita} onChange={(e) => set('fechaVisita', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear Acta'}
          </button>
        </div>
      </form>
    </div>
  );
}
