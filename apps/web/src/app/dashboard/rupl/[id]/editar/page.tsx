'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const tipoPersonaOpts = [
  { value: 'natural', label: 'Persona Natural' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'acfc', label: 'ACFC' },
  { value: 'comunidad_etnica', label: 'Comunidad Étnica' },
];

const estratoOpts = [
  { value: '', label: 'Seleccionar...' },
  { value: 'campesino', label: 'Campesino' },
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
];

interface Productor {
  id: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  direccionPredio?: string;
  telefonoContacto?: string;
  email?: string;
  codigoVereda?: string;
  codigoMunicipio: string;
  codigoDepartamento: string;
  estrato?: string;
  esComunidadEtnica: boolean;
  etnia?: string;
  estado: string;
}

export default function EditarProductorPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<Productor | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Productor>(`/rupl/productores/${params.id}`);
        setForm(data);
      } catch {
        setError('Error al cargar productor');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleChange = (field: string, value: any) => {
    if (!form) return;
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError('');
    try {
      await api.patch(`/rupl/productores/${params.id}`, {
        razonSocial: form.razonSocial,
        nombreComercial: form.nombreComercial,
        direccionPredio: form.direccionPredio,
        telefonoContacto: form.telefonoContacto,
        email: form.email,
        codigoVereda: form.codigoVereda,
        estrato: form.estrato || null,
        esComunidadEtnica: form.esComunidadEtnica,
        etnia: form.etnia,
        estado: form.estado,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/rupl/${params.id}`), 1000);
    } catch {
      setError('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;
  if (!form) return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-red-500 shadow-sm">Productor no encontrado</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">✏️ Editar Productor</h1>
          <p className="mt-1 text-sm text-slate-500">{form.razonSocial}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Guardado exitosamente</div>}

      <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Razón Social</label>
              <Input value={form.razonSocial} onChange={(e) => handleChange('razonSocial', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nombre Comercial</label>
              <Input value={form.nombreComercial || ''} onChange={(e) => handleChange('nombreComercial', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Tipo Persona</label>
              <Select
                options={tipoPersonaOpts}
                value={form.tipoPersona}
                onChange={(e) => handleChange('tipoPersona', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Estado</label>
              <Select
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'inactivo', label: 'Inactivo' },
                  { value: 'en_acreditacion', label: 'En Acreditación' },
                  { value: 'vencido', label: 'Vencido' },
                ]}
                value={form.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
              <Input value={form.telefonoContacto || ''} onChange={(e) => handleChange('telefonoContacto', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
              <Input type="email" value={form.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Dirección del Predio</label>
            <Input value={form.direccionPredio || ''} onChange={(e) => handleChange('direccionPredio', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Código Vereda</label>
              <Input value={form.codigoVereda || ''} onChange={(e) => handleChange('codigoVereda', e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Estrato</label>
              <Select
                options={estratoOpts}
                value={form.estrato || ''}
                onChange={(e) => handleChange('estrato', e.target.value || null)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="comunidadEtnica"
              checked={form.esComunidadEtnica}
              onChange={(e) => handleChange('esComunidadEtnica', e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="comunidadEtnica" className="text-sm text-slate-700">Comunidad Étnica</label>
            {form.esComunidadEtnica && (
              <Input
                placeholder="Nombre etnia"
                className="ml-2 max-w-xs"
                value={form.etnia || ''}
                onChange={(e) => handleChange('etnia', e.target.value)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
