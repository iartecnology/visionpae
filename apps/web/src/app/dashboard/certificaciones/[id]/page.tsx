'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface CertificacionDetail {
  id: string;
  numeroExpediente: string;
  productoCategoria: string;
  volumenRequeridoMensual: number;
  estado: string;
  fechaSolicitud: string;
  fechaResolucion?: string;
  dictamen?: string;
  periodoInicio: string;
  periodoFin: string;
  createdAt: string;
  contrato: { numero: string; valorTotal: number };
  evidencias: { id: string; tipo: string; descripcion: string; createdAt: string }[];
  referenciados: { id: string; nombre: string; ubicacion: string; productosOfrecidos: string[]; volumenDisponible: number }[];
}

export default function CertificacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cert, setCert] = useState<CertificacionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<CertificacionDetail>(`/certificaciones/${params.id}`);
      setCert(res);
    } catch {
      setCert(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando...</div>;
  if (!cert) return <div className="py-20 text-center text-sm text-red-500">Certificación no encontrada</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
        <h1 className="text-xl font-semibold text-slate-800">{cert.numeroExpediente}</h1>
        <Badge status={cert.estado} />
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Información General</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Contrato</dt><dd className="font-medium text-slate-800">{cert.contrato.numero}</dd></div>
          <div><dt className="text-slate-400">Categoría Producto</dt><dd className="font-medium text-slate-800">{cert.productoCategoria}</dd></div>
          <div><dt className="text-slate-400">Volumen Mensual</dt><dd className="font-medium text-slate-800">{cert.volumenRequeridoMensual} kg</dd></div>
          <div><dt className="text-slate-400">Fecha Solicitud</dt><dd className="font-medium text-slate-800">{formatDate(cert.fechaSolicitud)}</dd></div>
          <div><dt className="text-slate-400">Periodo</dt><dd className="font-medium text-slate-800">{formatDate(cert.periodoInicio)} — {formatDate(cert.periodoFin)}</dd></div>
          {cert.fechaResolucion && <div><dt className="text-slate-400">Fecha Resolución</dt><dd className="font-medium text-slate-800">{formatDate(cert.fechaResolucion)}</dd></div>}
        </dl>
        {cert.dictamen && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Dictamen</p>
            <p className="text-sm text-slate-700">{cert.dictamen}</p>
          </div>
        )}
      </div>

      {cert.referenciados.length > 0 && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Productores Referenciados (No Locales)</h2>
          <div className="divide-y divide-slate-100">
            {cert.referenciados.map((r) => (
              <div key={r.id} className="py-3">
                <p className="text-sm font-medium text-slate-800">{r.nombre}</p>
                <p className="text-xs text-slate-400">{r.ubicacion} · {r.productosOfrecidos.join(', ')} · {r.volumenDisponible} kg</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Evidencias</h2>
        {cert.evidencias.length === 0 ? (
          <p className="text-sm text-slate-400">No hay evidencias registradas</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {cert.evidencias.map((e) => (
              <div key={e.id} className="py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{e.tipo}</span>
                  <span className="text-xs text-slate-400">{formatDate(e.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-500">{e.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
