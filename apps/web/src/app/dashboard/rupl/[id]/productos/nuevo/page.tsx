'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const categoriaOpts = [
  { value: 'fruta', label: '🍎 Fruta' },
  { value: 'verdura', label: '🥬 Verdura' },
  { value: 'hortaliza', label: '🥕 Hortaliza' },
  { value: 'tuberculos', label: '🥔 Tubérculo' },
  { value: 'granos', label: '🌾 Grano' },
  { value: 'lacteo', label: '🥛 Lácteo' },
  { value: 'carnes', label: '🥩 Carne' },
  { value: 'huevos', label: '🥚 Huevo' },
  { value: 'miel', label: '🍯 Miel' },
  { value: 'panaderia', label: '🍞 Panadería' },
  { value: 'preparaciones', label: '🍲 Preparación' },
  { value: 'bebidas', label: '🥤 Bebida' },
  { value: 'procesado', label: '🏭 Procesado' },
  { value: 'otros', label: '📦 Otro' },
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

interface ProductoBase {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedidaDefecto: string;
  atributosSchema: any;
  certificacionesRequeridas: string[];
}

export default function NuevoProductoPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [buscandoBase, setBuscandoBase] = useState(false);
  const [baseQuery, setBaseQuery] = useState('');
  const [baseResults, setBaseResults] = useState<ProductoBase[]>([]);
  const [showBaseSearch, setShowBaseSearch] = useState(true);
  const [form, setForm] = useState({
    productoBaseId: '',
    nombre: '',
    categoria: 'fruta',
    unidadMedida: 'kg',
    volumenDisponible: '',
    precioReferencia: '',
  });
  const [presentaciones, setPresentaciones] = useState<{ nombre: string; volumen: string; unidadMedida: string; precio: string; stock: string }[]>([]);

  const buscarBase = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setBaseResults([]); return; }
    setBuscandoBase(true);
    try {
      const res = await api.get<{ data: ProductoBase[] }>(`/catalogo/productos?q=${encodeURIComponent(q)}&limit=10`);
      setBaseResults(res.data || []);
    } catch { setBaseResults([]); }
    finally { setBuscandoBase(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => buscarBase(baseQuery), 300);
    return () => clearTimeout(t);
  }, [baseQuery, buscarBase]);

  const seleccionarBase = (pb: ProductoBase) => {
    setForm({
      productoBaseId: pb.id,
      nombre: pb.nombre,
      categoria: pb.categoria,
      unidadMedida: pb.unidadMedidaDefecto || 'kg',
      volumenDisponible: '',
      precioReferencia: '',
    });
    setShowBaseSearch(false);
    setBaseResults([]);
    setBaseQuery('');
  };

  const limpiarBase = () => {
    setForm({ productoBaseId: '', nombre: '', categoria: 'fruta', unidadMedida: 'kg', volumenDisponible: '', precioReferencia: '' });
    setShowBaseSearch(true);
  };

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
        productoBaseId: form.productoBaseId || undefined,
        nombre: form.nombre,
        categoria: form.categoria,
        unidadMedida: form.unidadMedida,
        volumenDisponible: parseFloat(form.volumenDisponible),
        precioReferencia: form.precioReferencia ? parseFloat(form.precioReferencia) : undefined,
      };
      if (presentaciones.length > 0) {
        payload.presentaciones = presentaciones.map((p) => ({
          nombre: p.nombre,
          volumen: parseFloat(p.volumen),
          unidadMedida: p.unidadMedida,
          precio: parseFloat(p.precio),
          stock: parseFloat(p.stock),
        }));
      }
      await api.post(`/rupl/productores/${params.id}/productos`, payload);
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
          <h1 className="text-xl font-bold text-slate-800">Nuevo Producto</h1>
          <p className="mt-1 text-sm text-slate-500">Agregar producto al catálogo del productor</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Producto creado exitosamente</div>}

      <form onSubmit={handleSubmit}>
        {showBaseSearch && (
          <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Buscar en Catálogo Base</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="mb-3 text-xs text-slate-500">Selecciona un producto del catálogo base para pre-llenar los datos, o créalo desde cero.</p>
              <Input
                value={baseQuery}
                onChange={(e) => setBaseQuery(e.target.value)}
                placeholder="Buscar producto base..."
              />
              {buscandoBase && <p className="mt-2 text-xs text-slate-400">Buscando...</p>}
              {baseResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                  {baseResults.map((pb) => (
                    <button
                      key={pb.id}
                      type="button"
                      onClick={() => seleccionarBase(pb)}
                      className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-emerald-50 last:border-0"
                    >
                      <span className="font-medium text-slate-700">{pb.nombre}</span>
                      <span className="ml-2 text-xs text-slate-400">{pb.categoria}</span>
                    </button>
                  ))}
                </div>
              )}
              <Button type="button" variant="ghost" className="mt-2 text-xs" onClick={() => setShowBaseSearch(false)}>
                Omitir — crear desde cero
              </Button>
            </CardContent>
          </Card>
        )}

        {!showBaseSearch && form.productoBaseId && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Producto base seleccionado: <strong>{form.nombre}</strong>
            <button type="button" onClick={limpiarBase} className="ml-2 underline">Cambiar</button>
          </div>
        )}

        <Card className="mt-4 border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre del Producto</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Tomate Chonto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
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
                <label className="mb-1 block text-xs font-medium text-slate-600">Precio de Referencia</label>
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
              <p className="text-xs text-slate-400">Sin presentaciones adicionales. El producto se ofrecerá en la unidad seleccionada.</p>
            )}
            {presentaciones.map((p, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Presentación #{i + 1}</span>
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

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Producto'}</Button>
        </div>
      </form>
    </div>
  );
}
