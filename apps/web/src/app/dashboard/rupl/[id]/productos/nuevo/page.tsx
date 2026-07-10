'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const categoriaOpts = [
  { value: 'fruta', label: 'Fruta' },
  { value: 'verdura', label: 'Verdura' },
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'tuberculo', label: 'Tubérculo' },
  { value: 'grano', label: 'Grano' },
  { value: 'lacteo', label: 'Lácteo' },
  { value: 'carne', label: 'Carne' },
  { value: 'huevo', label: 'Huevo' },
  { value: 'miel', label: 'Miel' },
  { value: 'procesado', label: 'Procesado' },
  { value: 'otro', label: 'Otro' },
];

const unidadOpts = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'litro', label: 'Litro' },
  { value: 'bulto', label: 'Bulto' },
  { value: 'canasta', label: 'Canasta' },
];

export default function NuevoProductoPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    categoria: 'fruta',
    unidadMedida: 'kg',
    volumenDisponible: '',
    precioReferencia: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombre) { setError('Nombre del producto es requerido'); return; }
    if (!form.volumenDisponible) { setError('Volumen disponible es requerido'); return; }

    setSaving(true);
    try {
      await api.post(`/rupl/productores/${params.id}/productos`, {
        nombre: form.nombre,
        categoria: form.categoria,
        unidadMedida: form.unidadMedida,
        volumenDisponible: parseFloat(form.volumenDisponible),
        precioReferencia: form.precioReferencia ? parseFloat(form.precioReferencia) : undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/rupl/${params.id}`), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al crear producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🍎 Nuevo Producto</h1>
          <p className="mt-1 text-sm text-slate-500">Agregar producto al catálogo del productor</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Producto creado exitosamente</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre del Producto</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Tomate Chonto" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
                <Select options={categoriaOpts} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Unidad de Medida</label>
                <Select options={unidadOpts} value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Volumen Disponible</label>
                <Input type="number" step="0.01" min="0" value={form.volumenDisponible} onChange={(e) => setForm({ ...form, volumenDisponible: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Precio Referencia</label>
                <Input type="number" step="100" min="0" value={form.precioReferencia} onChange={(e) => setForm({ ...form, precioReferencia: e.target.value })} placeholder="Opcional" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Producto'}</Button>
        </div>
      </form>
    </div>
  );
}
