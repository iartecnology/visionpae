'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface IngredienteForm { nombre: string; categoriaProducto: string; cantidad: number; unidad: string; opcional: boolean; sustitutoPosible: string; }

const catOpts = [
  { value: 'fruta', label: 'Fruta' }, { value: 'verdura', label: 'Verdura' },
  { value: 'hortaliza', label: 'Hortaliza' }, { value: 'tuberculo', label: 'Tubérculo' },
  { value: 'grano', label: 'Grano' }, { value: 'lacteo', label: 'Lácteo' },
  { value: 'carne', label: 'Carne' }, { value: 'huevo', label: 'Huevo' },
  { value: 'miel', label: 'Miel' }, { value: 'procesado', label: 'Procesado' },
  { value: 'otro', label: 'Otro' },
];

const unidadOpts = [
  { value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }, { value: 'unidad', label: 'unidad' },
  { value: 'litro', label: 'litro' }, { value: 'docena', label: 'docena' },
  { value: 'arroba', label: 'arroba' }, { value: 'bulto', label: 'bulto' }, { value: 'caneca', label: 'caneca' },
];

export default function NuevaRecetaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    nombre: '', categoriaComida: 'almuerzo', porciones: 4, tiempoPreparacionMin: 30,
    dificultad: 'media', instrucciones: '', temporadaRecomendada: [] as number[],
    etiquetaCultural: [] as string[],
  });
  const [ingredientes, setIngredientes] = useState<IngredienteForm[]>([]);

  const addIngrediente = () => setIngredientes([...ingredientes, { nombre: '', categoriaProducto: 'otro', cantidad: 0, unidad: 'kg', opcional: false, sustitutoPosible: '' }]);
  const updateIng = (idx: number, field: string, value: any) => {
    const items = [...ingredientes]; (items[idx] as any)[field] = value; setIngredientes(items);
  };
  const removeIng = (idx: number) => setIngredientes(ingredientes.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.instrucciones) { setError('Nombre e instrucciones requeridos'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/recetas', {
        ...form,
        etiquetaCultural: form.etiquetaCultural.filter(Boolean),
        ingredientes: ingredientes.filter((i) => i.nombre),
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/minutas'), 1200);
    } catch (err: any) { setError(err?.message || 'Error al crear receta'); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🍳 Nueva Receta</h1>
          <p className="mt-1 text-sm text-slate-500">Crear una receta para el plan de alimentación</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Receta creada</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre de la Receta</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Arroz con Pollo" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tipo Comida</label>
                <Select options={[{ value: 'desayuno', label: 'Desayuno' }, { value: 'almuerzo', label: 'Almuerzo' }, { value: 'cena', label: 'Cena' }, { value: 'refrigerio', label: 'Refrigerio' }]} value={form.categoriaComida} onChange={(e) => setForm({ ...form, categoriaComida: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Porciones</label>
                <Input type="number" min={1} value={form.porciones} onChange={(e) => setForm({ ...form, porciones: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Tiempo (min)</label>
                <Input type="number" min={1} value={form.tiempoPreparacionMin} onChange={(e) => setForm({ ...form, tiempoPreparacionMin: Number(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Dificultad</label>
                <Select options={[{ value: 'baja', label: 'Baja' }, { value: 'media', label: 'Media' }, { value: 'alta', label: 'Alta' }]} value={form.dificultad} onChange={(e) => setForm({ ...form, dificultad: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Instrucciones</label>
              <textarea value={form.instrucciones} onChange={(e) => setForm({ ...form, instrucciones: e.target.value })} rows={4} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Describa el paso a paso..." />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700">Ingredientes</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addIngrediente}>+ Agregar</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {ingredientes.length === 0 && <p className="text-sm text-slate-400">No hay ingredientes agregados</p>}
            {ingredientes.map((ing, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">Nombre</label>
                  <Input className="h-8 text-xs" value={ing.nombre} onChange={(e) => updateIng(idx, 'nombre', e.target.value)} placeholder="Tomate" />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">Cant</label>
                  <Input type="number" min={0} step={0.1} className="h-8 text-xs" value={ing.cantidad || ''} onChange={(e) => updateIng(idx, 'cantidad', Number(e.target.value))} />
                </div>
                <div className="w-20">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">Unidad</label>
                  <Select options={unidadOpts} className="h-8 text-xs" value={ing.unidad} onChange={(e) => updateIng(idx, 'unidad', e.target.value)} />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-[10px] font-medium text-slate-500">Categoría</label>
                  <Select options={catOpts} className="h-8 text-xs" value={ing.categoriaProducto} onChange={(e) => updateIng(idx, 'categoriaProducto', e.target.value)} />
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" checked={ing.opcional} onChange={(e) => updateIng(idx, 'opcional', e.target.checked)} className="h-3 w-3 rounded border-slate-300 text-emerald-600" />
                  <span className="text-[10px] text-slate-500">Opc.</span>
                </div>
                <button type="button" onClick={() => removeIng(idx)} className="py-2 text-xs text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Receta'}</Button>
        </div>
      </form>
    </div>
  );
}
