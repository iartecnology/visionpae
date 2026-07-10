'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const tipoDocOptions = ['CC', 'NIT', 'CE', 'Pasaporte', 'otro'];
const tipoPersonaOptions = [
  { value: 'natural', label: 'Persona Natural' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'acfc', label: 'ACFC' },
  { value: 'comunidad_etnica', label: 'Comunidad Étnica' },
];
const estratoOptions = [
  { value: '', label: 'Seleccionar...' },
  { value: 'campesino', label: 'Campesino' },
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
];

export default function NuevoProductorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tipoPersona: 'natural',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    razonSocial: '',
    nombreComercial: '',
    direccionPredio: '',
    telefonoContacto: '',
    email: '',
    codigoVereda: '',
    codigoMunicipio: '',
    codigoDepartamento: '15',
    estrato: '',
    esComunidadEtnica: false,
    etnia: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/rupl/productores', form);
      router.push('/dashboard/rupl');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
        <h1 className="text-xl font-semibold text-slate-800">Nuevo Productor</h1>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de Persona</label>
            <select value={form.tipoPersona} onChange={(e) => set('tipoPersona', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
              {tipoPersonaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de Documento</label>
            <select value={form.tipoDocumento} onChange={(e) => set('tipoDocumento', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
              {tipoDocOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Número de Documento *</label>
            <input value={form.numeroDocumento} onChange={(e) => set('numeroDocumento', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Razón Social *</label>
            <input value={form.razonSocial} onChange={(e) => set('razonSocial', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nombre Comercial</label>
            <input value={form.nombreComercial} onChange={(e) => set('nombreComercial', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Teléfono</label>
            <input value={form.telefonoContacto} onChange={(e) => set('telefonoContacto', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Dirección del Predio</label>
          <input value={form.direccionPredio} onChange={(e) => set('direccionPredio', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Código Departamento</label>
            <input value={form.codigoDepartamento} onChange={(e) => set('codigoDepartamento', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Código Municipio *</label>
            <input value={form.codigoMunicipio} onChange={(e) => set('codigoMunicipio', e.target.value)} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Código Vereda</label>
            <input value={form.codigoVereda} onChange={(e) => set('codigoVereda', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Estrato</label>
            <select value={form.estrato} onChange={(e) => set('estrato', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500">
              {estratoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.esComunidadEtnica} onChange={(e) => set('esComunidadEtnica', e.target.checked)} className="rounded border-slate-300" />
              Comunidad Étnica
            </label>
          </div>
        </div>

        {form.esComunidadEtnica && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Etnia</label>
            <input value={form.etnia} onChange={(e) => set('etnia', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar Productor'}
          </button>
        </div>
      </form>
    </div>
  );
}
