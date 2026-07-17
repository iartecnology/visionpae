'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface ProductoBase {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedidaDefecto: string;
  codigoUnspsc: string | null;
  codigoSipsa: string | null;
  certificacionesRequeridas: string[];
  fotoUrl: string | null;
  activo: boolean;
  createdAt: string;
}

const categoriaOpts = [
  { value: '', label: 'Todas' },
  { value: 'fruta', label: 'Fruta' },
  { value: 'verdura', label: 'Verdura' },
  { value: 'hortaliza', label: 'Hortaliza' },
  { value: 'tuberculos', label: 'Tubérculo' },
  { value: 'granos', label: 'Grano' },
  { value: 'lacteo', label: 'Lácteo' },
  { value: 'carnes', label: 'Carne' },
  { value: 'huevos', label: 'Huevo' },
  { value: 'miel', label: 'Miel' },
  { value: 'panaderia', label: 'Panadería' },
  { value: 'preparaciones', label: 'Preparación' },
  { value: 'bebidas', label: 'Bebida' },
  { value: 'procesado', label: 'Procesado' },
  { value: 'otros', label: 'Otro' },
];

const unidadOpts = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'litro', label: 'Litro' },
  { value: 'docena', label: 'Docena' },
  { value: 'arroba', label: 'Arroba' },
  { value: 'bulto', label: 'Bulto' },
  { value: 'caneca', label: 'Caneca' },
];

export default function AdminCatalogoPage() {
  const [items, setItems] = useState<ProductoBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (categoria) params.set('categoria', categoria);
      params.set('limit', '100');
      const res = await api.get<{ data: ProductoBase[] }>(`/catalogo/productos?${params.toString()}`);
      setItems(res.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [q, categoria]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    const payload: any = {
      nombre: form.nombre,
      categoria: form.categoria,
      unidadMedidaDefecto: form.unidadMedidaDefecto,
      certificacionesRequeridas: form.certificacionesRequeridas ? form.certificacionesRequeridas.split(',').map((s) => s.trim()) : [],
    };
    if (form.codigoUnspsc) payload.codigoUnspsc = form.codigoUnspsc;
    if (form.codigoSipsa) payload.codigoSipsa = form.codigoSipsa;

    if (editing) {
      await api.patch(`/catalogo/productos/${editing}`, payload);
    } else {
      await api.post('/catalogo/productos', payload);
    }
    setEditing(null);
    setShowForm(false);
    setForm({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '' });
    load();
  };

  const handleEdit = (item: ProductoBase) => {
    setEditing(item.id);
    setShowForm(true);
    setForm({
      nombre: item.nombre,
      categoria: item.categoria,
      unidadMedidaDefecto: item.unidadMedidaDefecto,
      codigoUnspsc: item.codigoUnspsc || '',
      codigoSipsa: item.codigoSipsa || '',
      certificacionesRequeridas: item.certificacionesRequeridas?.join(', ') || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este producto base?')) return;
    await api.delete(`/catalogo/productos/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">Catálogo Base de Productos</h1>
        <p className="mt-1 text-sm text-slate-500">Administra los productos de referencia del sistema</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto base..."
            className="min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            {categoriaOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => { setEditing(null); setShowForm(true); setForm({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '' }); }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Nuevo Producto Base
          </button>
        </div>
      </div>

      {/* Formulario nuevo/editar */}
      {(editing !== null || showForm) && (
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">{editing ? 'Editar' : 'Nuevo'} Producto Base</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre *</label>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
                {categoriaOpts.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Unidad por Defecto</label>
              <select value={form.unidadMedidaDefecto} onChange={(e) => setForm({ ...form, unidadMedidaDefecto: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
                {unidadOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Código UNSPSC</label>
              <input value={form.codigoUnspsc} onChange={(e) => setForm({ ...form, codigoUnspsc: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="Ej: 10101501" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Código SIPSA</label>
              <input value={form.codigoSipsa} onChange={(e) => setForm({ ...form, codigoSipsa: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="Opcional" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Certificaciones Requeridas</label>
              <input value={form.certificacionesRequeridas} onChange={(e) => setForm({ ...form, certificacionesRequeridas: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="ICA, BPA (separado por coma)" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Guardar</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">UNSPSC</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">SIPSA</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Certificaciones</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.nombre}</td>
                  <td className="px-4 py-3 text-slate-500"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{item.categoria}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.codigoUnspsc || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.codigoSipsa || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{item.certificacionesRequeridas?.join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${item.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(item)} className="mr-2 text-xs text-emerald-600 hover:text-emerald-800">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">Desactivar</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No hay productos base registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
