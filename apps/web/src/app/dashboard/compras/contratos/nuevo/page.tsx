'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface UserOption {
  id: string;
  nombreCompleto: string;
  email: string;
}

export default function NuevoContratoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [operadores, setOperadores] = useState<UserOption[]>([]);
  const [form, setForm] = useState({
    numero: '',
    operadorId: '',
    objeto: '',
    periodoInicio: '',
    periodoFin: '',
    valorTotal: '',
    presupuestoComprasLocales: '',
    tipo: 'anual',
  });

  useEffect(() => {
    api.get<any>('/admin/usuarios').then((res) => {
      const users: any[] = Array.isArray(res) ? res : (res?.data || []);
      setOperadores(users.map((u: any) => ({ id: u.id, nombreCompleto: u.nombreCompleto, email: u.email })));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.numero || !form.operadorId || !form.objeto || !form.periodoInicio || !form.periodoFin) {
      setError('Complete todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      await api.post('/compras/contratos', {
        ...form,
        valorTotal: parseFloat(form.valorTotal) || 0,
        presupuestoComprasLocales: parseFloat(form.presupuestoComprasLocales) || 0,
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/compras/contratos'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al crear contrato');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📋 Nuevo Contrato</h1>
          <p className="mt-1 text-sm text-slate-500">Crear contrato marco del PAE</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Contrato creado exitosamente</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información del Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">N° Contrato</label>
                <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="Ej: CT-2026-001" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
                <Select
                  options={[
                    { value: 'anual', label: 'Anual' },
                    { value: 'semestral', label: 'Semestral' },
                    { value: 'trimestral', label: 'Trimestral' },
                  ]}
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Operador</label>
              <select
                value={form.operadorId}
                onChange={(e) => setForm({ ...form, operadorId: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccionar operador...</option>
                {operadores.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombreCompleto} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Objeto del Contrato</label>
              <textarea
                value={form.objeto}
                onChange={(e) => setForm({ ...form, objeto: e.target.value })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Describa el objeto del contrato..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Período Inicio</label>
                <Input type="date" value={form.periodoInicio} onChange={(e) => setForm({ ...form, periodoInicio: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Período Fin</label>
                <Input type="date" value={form.periodoFin} onChange={(e) => setForm({ ...form, periodoFin: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Valor Total ($)</label>
                <Input type="number" min="0" step="100000" value={form.valorTotal} onChange={(e) => setForm({ ...form, valorTotal: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Presupuesto Compras Locales ($)</label>
                <Input type="number" min="0" step="100000" value={form.presupuestoComprasLocales} onChange={(e) => setForm({ ...form, presupuestoComprasLocales: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Contrato'}</Button>
        </div>
      </form>
    </div>
  );
}
