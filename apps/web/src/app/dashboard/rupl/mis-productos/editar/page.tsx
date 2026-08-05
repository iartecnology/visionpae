'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const categoriaOpts = [
  { value: 'fruta', label: 'Fruta' },
  { value: 'verdura', label: 'Verdura' },
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'tuberculos', label: 'Tuberculo' },
  { value: 'granos', label: 'Grano' },
  { value: 'lacteo', label: 'Lacteo' },
  { value: 'carnes', label: 'Carne' },
  { value: 'huevos', label: 'Huevo' },
  { value: 'miel', label: 'Miel' },
  { value: 'panaderia', label: 'Panaderia' },
  { value: 'preparaciones', label: 'Preparacion' },
  { value: 'bebidas', label: 'Bebida' },
  { value: 'procesado', label: 'Procesado' },
  { value: 'otros', label: 'Otro' },
];

const unidadOpts = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'litro', label: 'Litro' },
  { value: 'docena', label: 'Docena' },
  { value: 'arroba', label: 'Arroba' },
  { value: 'bulto', label: 'Bulto' },
  { value: 'caneca', label: 'Caneca' },
];

function EditarMiProductoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prodId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
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
  const [presentaciones, setPresentaciones] = useState<{ id?: string; nombre: string; volumen: string; unidadMedida: string; precio: string; stock: string }[]>([]);
  const [baseSchema, setBaseSchema] = useState<Record<string, string[]> | null>(null);
  const [atributos, setAtributos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!prodId) { setError('ID de producto no encontrado'); setLoading(false); return; }
    api.get<any>(`/rupl/productores/mis-productos/${prodId}`)
      .then((p) => {
        setForm({
          nombre: p.nombre || '',
          categoria: p.categoria || 'fruta',
          unidadMedida: p.unidadMedida || 'kg',
          volumenDisponible: String(p.volumenDisponible ?? ''),
          precioReferencia: p.precioReferencia ? String(p.precioReferencia) : '',
        });
        const schema = p.productoBase?.atributosSchema || null;
        setBaseSchema(schema);
        const attrs: Record<string, string> = {};
        if (schema) {
          for (const [key, opts] of Object.entries<string[]>(schema)) {
            attrs[key] = p.atributos?.[key] || (Array.isArray(opts) && opts.length ? opts[0] : '');
          }
        }
        setAtributos(attrs);
        setPresentaciones((p.presentaciones || []).map((pr: any) => ({
          id: pr.id,
          nombre: pr.nombre,
          volumen: String(pr.volumen),
          unidadMedida: pr.unidadMedida,
          precio: String(pr.precio),
          stock: String(pr.stock),
        })));
      })
      .catch(() => setError('Error al cargar producto'))
      .finally(() => setLoading(false));
  }, [prodId]);

  const agregarPresentacion = () => {
    setPresentaciones([...presentaciones, { nombre: '', volumen: '', unidadMedida: 'kg', precio: '', stock: '' }]);
  };

  const actualizarPresentacion = (i: number, field: string, value: string) => {
    const copy = [...presentaciones];
    (copy[i] as any)[field] = value;
    setPresentaciones(copy);
  };

  const eliminarPresentacion = (i: number) => {
    setPresentaciones(presentaciones.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombre) { setError('Nombre del producto es requerido'); return; }
    if (!form.volumenDisponible) { setError('Volumen disponible es requerido'); return; }

    setSaving(true);
    try {
      const payload: any = {
        nombre: form.nombre,
        categoria: form.categoria,
        unidadMedida: form.unidadMedida,
        volumenDisponible: parseFloat(form.volumenDisponible),
        precioReferencia: form.precioReferencia ? parseFloat(form.precioReferencia) : undefined,
      };
      if (Object.keys(atributos).length > 0) payload.atributos = atributos;
      await api.patch(`/rupl/productores/mis-productos/${prodId}`, payload);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/rupl/mis-productos'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando producto...</div>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Editar Producto</h1>
          <p className="mt-1 text-sm text-slate-500">Actualizar la informacion de tu producto</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Producto actualizado exitosamente</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Informacion del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre del Producto</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Tomate Chonto" disabled={!!baseSchema} />
              {baseSchema && <p className="mt-1 text-[10px] text-emerald-600">El nombre proviene de la plantilla seleccionada</p>}
            </div>
            {baseSchema && Object.keys(baseSchema).length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <p className="mb-2 text-xs font-medium text-slate-600">Características del producto</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Object.entries(baseSchema).map(([key, opts]) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium capitalize text-slate-600">{key}</label>
                      <Select
                        options={opts.map((o) => ({ value: o, label: o }))}
                        value={atributos[key] || ''}
                        onChange={(e) => setAtributos({ ...atributos, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoria</label>
                <Select options={categoriaOpts} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Unidad de Medida</label>
                <Select options={unidadOpts} value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Volumen Disponible</label>
                <Input type="number" step="0.01" min="0" value={form.volumenDisponible} onChange={(e) => setForm({ ...form, volumenDisponible: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Precio de Referencia (COP)</label>
                <Input type="number" step="100" min="0" value={form.precioReferencia} onChange={(e) => setForm({ ...form, precioReferencia: e.target.value })} placeholder="Opcional" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4 border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Presentaciones / Empaques</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={agregarPresentacion}>+ Agregar</Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {presentaciones.length === 0 && (
              <p className="text-xs text-slate-400">Sin presentaciones adicionales.</p>
            )}
            {presentaciones.map((p, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Presentacion #{i + 1}</span>
                  <button type="button" onClick={() => eliminarPresentacion(i)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={p.nombre} onChange={(e) => actualizarPresentacion(i, 'nombre', e.target.value)} placeholder="Ej: Bolsa 5kg" className="text-xs" />
                  <Select options={unidadOpts} value={p.unidadMedida} onChange={(e: any) => actualizarPresentacion(i, 'unidadMedida', e.target.value)} />
                  <Input type="number" step="0.01" value={p.volumen} onChange={(e) => actualizarPresentacion(i, 'volumen', e.target.value)} placeholder="Volumen" className="text-xs" />
                  <Input type="number" step="100" value={p.precio} onChange={(e) => actualizarPresentacion(i, 'precio', e.target.value)} placeholder="Precio $" className="text-xs" />
                  <Input type="number" step="0.01" value={p.stock} onChange={(e) => actualizarPresentacion(i, 'stock', e.target.value)} placeholder="Stock disponible" className="text-xs" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
        </div>
      </form>
    </div>
  );
}

export default function EditarMiProductoPage() {
  return (
    <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>}>
      <EditarMiProductoForm />
    </Suspense>
  );
}
