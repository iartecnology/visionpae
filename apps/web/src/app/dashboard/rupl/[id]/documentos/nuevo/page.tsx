'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const tipoDocOpts = [
  { value: 'registro_ica', label: 'Registro ICA' },
  { value: 'camara_comercio', label: 'Cámara de Comercio' },
  { value: 'rut', label: 'RUT' },
  { value: 'certificacion_bpa', label: 'Certificación BPA' },
  { value: 'certificacion_origen_etnico', label: 'Certificación Origen Étnico' },
  { value: 'certificacion_asociacion', label: 'Certificación Asociación' },
  { value: 'otro', label: 'Otro' },
];

export default function NuevoDocumentoPage() {
  const params = useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tipo, setTipo] = useState('rut');
  const [fechaExpedicion, setFechaExpedicion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [diasAviso, setDiasAviso] = useState('30');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) { setError('Seleccione un archivo'); return; }
    if (!fechaExpedicion) { setError('Ingrese fecha de expedición'); return; }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploading(true);
      const uploadRes = await api.post<{ url: string; originalName: string; mimeType: string; size: number }>(
        `/rupl/productores/${params.id}/documentos/subir`,
        formData,
        true,
      );
      setUploading(false);

      await api.post(`/rupl/productores/${params.id}/documentos`, {
        tipo,
        archivoUrl: uploadRes.url,
        mimeType: uploadRes.mimeType || file.type,
        tamanoBytes: uploadRes.size || file.size,
        fechaExpedicion,
        fechaVencimiento: fechaVencimiento || undefined,
        diasAvisoVencimiento: parseInt(diasAviso) || 30,
      });

      setSuccess(true);
      setTimeout(() => router.push(`/dashboard/rupl/${params.id}`), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error al subir documento');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">📄 Nuevo Documento</h1>
          <p className="mt-1 text-sm text-slate-500">Adjuntar documento de acreditación</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">Documento subido exitosamente</div>}

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Información del Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Tipo de Documento</label>
              <Select options={tipoDocOpts} value={tipo} onChange={(e) => setTipo(e.target.value)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Archivo (PDF, JPG, PNG)</label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file && <p className="mt-1 text-xs text-slate-400">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Fecha Expedición</label>
                <Input type="date" value={fechaExpedicion} onChange={(e) => setFechaExpedicion(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Fecha Vencimiento</label>
                <Input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Días Aviso Vencimiento</label>
              <Input type="number" min="0" value={diasAviso} onChange={(e) => setDiasAviso(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={saving || uploading}>
            {uploading ? 'Subiendo archivo...' : saving ? 'Guardando...' : 'Subir Documento'}
          </Button>
        </div>
      </form>
    </div>
  );
}
