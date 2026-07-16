'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function NuevaRuedaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ nombre: '', fecha: '', lugar: '', descripcion: '', tipo: 'presencial' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.fecha || !form.lugar) { setError('Complete todos los campos requeridos'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/ruedas', form);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/ruedas'), 1200);
    } catch (err: any) { setError(err?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🤝 Nueva Rueda de Negocio</h1>
          <p className="mt-1 text-sm text-slate-500">Organizar una rueda de negocio</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Rueda creada</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información de la Rueda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre</label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Rueda de Negocios Tunja Julio 2026" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Fecha</label>
                <Input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
                <Select options={[{ value: 'presencial', label: 'Presencial' }, { value: 'virtual', label: 'Virtual' }, { value: 'mixta', label: 'Mixta' }]} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Lugar</label>
              <Input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} placeholder="Ej: Centro de Convenciones" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" placeholder="Describa el propósito de la rueda..." />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Rueda'}</Button>
        </div>
      </form>
    </div>
  );
}
