'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { LocationFilter } from '@/components/location-filter';

interface ProductoBase {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedidaDefecto: string;
  codigoUnspsc: string | null;
  codigoSipsa: string | null;
  certificacionesRequeridas: string[];
  atributosSchema: Record<string, string[]> | null;
  fotoUrl: string | null;
  activo: boolean;
  createdAt: string;
  _count?: { ofrecidos: number };
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
  const [form, setForm] = useState({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '', fotoUrl: '', atributos: [] as { key: string; options: string }[] });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
    if (form.fotoUrl) payload.fotoUrl = form.fotoUrl;

    const schema: Record<string, string[]> = {};
    for (const a of form.atributos) {
      const key = a.key.trim();
      if (!key) continue;
      schema[key] = a.options.split(',').map((s) => s.trim()).filter(Boolean);
    }
    payload.atributosSchema = schema;

    if (editing) {
      await api.patch(`/catalogo/productos/${editing}`, payload);
    } else {
      await api.post('/catalogo/productos', payload);
    }
    setEditing(null);
    setShowForm(false);
    setForm({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '', fotoUrl: '', atributos: [] });
    load();
  };

  const handleEdit = (item: ProductoBase) => {
    setEditing(item.id);
    setShowForm(true);
    const schema = item.atributosSchema || {};
    setForm({
      nombre: item.nombre,
      categoria: item.categoria,
      unidadMedidaDefecto: item.unidadMedidaDefecto,
      codigoUnspsc: item.codigoUnspsc || '',
      codigoSipsa: item.codigoSipsa || '',
      certificacionesRequeridas: item.certificacionesRequeridas?.join(', ') || '',
      fotoUrl: item.fotoUrl || '',
      atributos: Object.entries(schema).map(([key, options]) => ({ key, options: (options || []).join(', ') })),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este producto base?')) return;
    await api.delete(`/catalogo/productos/${id}`);
    load();
  };

  const hasActiveFilters = !!(q || categoria);
  const activeFilterCount = (q ? 1 : 0) + (categoria ? 1 : 0);

  const clearFilters = () => { setQ(''); setCategoria(''); };

  const activeFilterChips = (() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (q) chips.push({ label: `"${q}"`, onRemove: () => setQ('') });
    if (categoria) chips.push({ label: categoria, onRemove: () => setCategoria('') });
    return chips;
  })();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:p-5">
        <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Catálogo Base de Productos</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Administra los productos de referencia del sistema</p>

        {/* Desktop filters */}
        <div className="mt-4 hidden flex-wrap items-center gap-3 sm:flex">
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
            onClick={() => { setEditing(null); setShowForm(true); setForm({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '', fotoUrl: '', atributos: [] }); }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Nuevo Producto Base
          </button>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors sm:hidden',
            hasActiveFilters ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600'
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilterCount}</span>
          )}
        </button>

        {activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {activeFilterChips.map((chip, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                {chip.label}
                <button onClick={chip.onRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-[11px] text-slate-400 hover:text-slate-600 ml-1">Limpiar todo</button>
          </div>
        )}

        <div className="mt-3 sm:hidden">
          <button
            onClick={() => { setEditing(null); setShowForm(true); setForm({ nombre: '', categoria: 'fruta', unidadMedidaDefecto: 'kg', codigoUnspsc: '', codigoSipsa: '', certificacionesRequeridas: '', fotoUrl: '', atributos: [] }); }}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + Nuevo Producto Base
          </button>
        </div>
      </div>

      {/* Formulario nuevo/editar */}
      {(editing !== null || showForm) && (
        <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:p-5">
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
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-slate-600">Foto (URL)</label>
              <input value={form.fotoUrl} onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="/img/productos/tomate.jpg" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-600">Atributos de la plantilla</label>
                <button
                  onClick={() => setForm({ ...form, atributos: [...form.atributos, { key: '', options: '' }] })}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                >
                  + Agregar atributo
                </button>
              </div>
              <p className="mb-2 text-[11px] text-slate-400">Ej: variedad → sabanera, pastusa, criolla | procedencia → nacional</p>
              <div className="space-y-2">
                {form.atributos.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">Sin atributos definidos</p>
                )}
                {form.atributos.map((a, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2 sm:flex-row">
                    <input
                      value={a.key}
                      onChange={(e) => {
                        const next = [...form.atributos];
                        next[i] = { ...next[i], key: e.target.value };
                        setForm({ ...form, atributos: next });
                      }}
                      placeholder="clave"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 sm:w-40"
                    />
                    <input
                      value={a.options}
                      onChange={(e) => {
                        const next = [...form.atributos];
                        next[i] = { ...next[i], options: e.target.value };
                        setForm({ ...form, atributos: next });
                      }}
                      placeholder="opción1, opción2, opción3"
                      className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setForm({ ...form, atributos: form.atributos.filter((_, j) => j !== i) })}
                      className="shrink-0 rounded-lg px-2 text-xs text-red-500 hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Guardar</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200/60 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Categoría</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">UNSPSC</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">SIPSA</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Certificaciones</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">En uso</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.fotoUrl ? (
                          <img src={item.fotoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : null}
                        <span className="font-medium text-slate-800">{item.nombre}</span>
                        {item.atributosSchema && Object.keys(item.atributosSchema).length > 0 && (
                          <span className="block text-[10px] text-slate-400">{Object.entries(item.atributosSchema).map(([k, v]) => `${k}: ${v.join('|')}`).join(' · ')}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{item.categoria}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.codigoUnspsc || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.codigoSipsa || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{item.certificacionesRequeridas?.join(', ') || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${item._count?.ofrecidos ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                        {item._count?.ofrecidos ?? 0} ofrecido{(item._count?.ofrecidos ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </td>
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
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">No hay productos base registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {items.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay productos base registrados</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.fotoUrl ? (
                        <img src={item.fotoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : null}
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.nombre}</p>
                        <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px]">{item.categoria}</span>
                        {item.atributosSchema && Object.keys(item.atributosSchema).length > 0 && (
                          <p className="mt-1 text-[10px] text-slate-400">{Object.entries(item.atributosSchema).map(([k, v]) => `${k}: ${v.join('|')}`).join(' · ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${item._count?.ofrecidos ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                        {item._count?.ofrecidos ?? 0} ofrecido{(item._count?.ofrecidos ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${item.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    {item.codigoUnspsc && <p><span className="text-slate-400">UNSPSC:</span> {item.codigoUnspsc}</p>}
                    {item.codigoSipsa && <p><span className="text-slate-400">SIPSA:</span> {item.codigoSipsa}</p>}
                    {item.certificacionesRequeridas?.length > 0 && <p><span className="text-slate-400">Certs:</span> {item.certificacionesRequeridas.join(', ')}</p>}
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <button onClick={() => handleEdit(item)} className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Desactivar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 bg-white px-5 pt-3 pb-0">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-semibold text-slate-800">Filtros</h3>
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs font-medium text-primary">Limpiar todo</button>
                  )}
                  <button onClick={() => setShowMobileFilters(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-5 px-5 py-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Buscar producto</label>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre del producto..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary">
                  {categoriaOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-4">
              <button onClick={() => setShowMobileFilters(false)} className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
                Ver {items.length} resultado{items.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}