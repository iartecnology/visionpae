'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ContratoOption { id: string; numero: string; }
interface ProductorOption { id: string; razonSocial: string; numeroDocumento: string; }
interface ProductoOption { id: string; nombre: string; categoria: string; unidadMedida: string; precioReferencia: number | null; }
interface LineItem { productoId: string; nombreProducto: string; cantidad: number; unidadMedida: string; precioUnitario: number; }

function NuevaOrdenForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contratos, setContratos] = useState<ContratoOption[]>([]);
  const [productores, setProductores] = useState<ProductorOption[]>([]);
  const [productos, setProductos] = useState<ProductoOption[]>([]);
  const [form, setForm] = useState({
    contratoId: searchParams.get('contratoId') || '',
    productorId: '',
    fechaEntregaProgramada: '',
    items: [] as LineItem[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [contratosRes, prodRes] = await Promise.all([
          api.get<ContratoOption[]>('/compras/contratos'),
          api.get<{ data: ProductorOption[] }>('/rupl/productores?limit=200'),
        ]);
        setContratos(Array.isArray(contratosRes) ? contratosRes : []);
        setProductores(prodRes?.data || []);
      } catch {}
    })();
  }, []);

  const loadProductos = async (productorId: string) => {
    try {
      const data = await api.get<ProductoOption[]>(`/rupl/productores/${productorId}/productos`);
      setProductos(Array.isArray(data) ? data : []);
    } catch { setProductos([]); }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleProductorChange = (id: string) => {
    set('productorId', id);
    set('items', []);
    if (id) loadProductos(id);
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { productoId: '', nombreProducto: '', cantidad: 0, unidadMedida: 'kg', precioUnitario: 0 }] }));

  const updateItem = (idx: number, field: string, value: any) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === 'productoId') {
        const prod = productos.find((p) => p.id === value);
        if (prod) { items[idx].nombreProducto = prod.nombre; items[idx].unidadMedida = prod.unidadMedida; if (prod.precioReferencia) items[idx].precioUnitario = prod.precioReferencia; }
      }
      return { ...f, items };
    });
  };

  const removeItem = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const total = form.items.reduce((sum, i) => sum + i.cantidad * i.precioUnitario, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productorId || form.items.length === 0 || !form.contratoId) { setError('Complete todos los campos requeridos'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/compras/ordenes', { ...form, items: form.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad, unidadMedida: i.unidadMedida, precioUnitario: i.precioUnitario })) });
      router.push('/dashboard/compras');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📝 Nueva Orden de Compra</h1>
          <p className="mt-1 text-sm text-slate-500">Crear una orden para la entrega de productos</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Contrato *</label>
                <select
                  value={form.contratoId}
                  onChange={(e) => set('contratoId', e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seleccionar contrato...</option>
                  {contratos.map((c) => (<option key={c.id} value={c.id}>{c.numero}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Fecha de Entrega *</label>
                <Input type="date" value={form.fechaEntregaProgramada} onChange={(e) => set('fechaEntregaProgramada', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Productor *</label>
              <select
                value={form.productorId}
                onChange={(e) => handleProductorChange(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Seleccionar productor...</option>
                {productores.map((p) => (<option key={p.id} value={p.id}>{p.razonSocial} ({p.numeroDocumento})</option>))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">Items *</label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>+ Agregar</Button>
              </div>

              {form.items.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">Agregue productos a la orden</p>
              )}

              {form.items.map((item, idx) => (
                <div key={idx} className="mb-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Item #{idx + 1}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-700">✕ Eliminar</button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <select
                      value={item.productoId}
                      onChange={(e) => updateItem(idx, 'productoId', e.target.value)}
                      className="col-span-2 rounded-md border border-input bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-400"
                    >
                      <option value="">Producto...</option>
                      {productos.map((p) => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                    </select>
                    <Input type="number" value={item.cantidad || ''} onChange={(e) => updateItem(idx, 'cantidad', Number(e.target.value))} placeholder="Cant." min={0} className="h-8 text-xs" />
                    <Input type="number" value={item.precioUnitario || ''} onChange={(e) => updateItem(idx, 'precioUnitario', Number(e.target.value))} placeholder="P.U." min={0} className="h-8 text-xs" />
                    <div className="flex items-center text-xs font-medium text-slate-700">{formatCurrency(item.cantidad * item.precioUnitario)}</div>
                  </div>
                </div>
              ))}

              {form.items.length > 0 && (
                <div className="flex justify-end border-t border-slate-100 pt-3 text-sm font-semibold text-slate-800">
                  Total: {formatCurrency(total)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving || form.items.length === 0 || !form.contratoId}>
            {saving ? 'Creando...' : 'Crear Orden'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NuevaOrdenPage() {
  return (
    <Suspense fallback={<div className="rounded-xl border bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>}>
      <NuevaOrdenForm />
    </Suspense>
  );
}
