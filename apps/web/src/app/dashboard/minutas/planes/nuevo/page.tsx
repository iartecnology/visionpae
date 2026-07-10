'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function NuevoPlanPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ nombre: '', fechaInicio: '', fechaFin: '', observaciones: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.fechaInicio || !form.fechaFin) { setError('Complete todos los campos'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/planes-semanales', form);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/minutas'), 1200);
    } catch (err: any) { setError(err?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📅 Nuevo Plan Semanal</h1>
          <p className="mt-1 text-sm text-slate-500">Crear un plan de alimentación semanal</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Plan creado</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información del Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Plan Semana 1 - Julio" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Fecha Inicio</label>
                <Input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Fecha Fin</label>
                <Input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Observaciones</label>
              <textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Plan'}</Button>
        </div>
      </form>
    </div>
  );
}
