'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/star-rating';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/mapa/map-picker'), { ssr: false });

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
  latitud?: number;
  longitud?: number;
  estrato?: string;
  esComunidadEtnica: boolean;
  etnia?: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
  productos?: ProductoOfrecido[];
  documentos?: Documento[];
}

interface ProductoOfrecido {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  precioReferencia?: number;
  activo: boolean;
}

interface Documento {
  id: string;
  tipo: string;
  archivoUrl?: string;
  verificado?: boolean;
  fechaExpedicion?: string;
  fechaVencimiento?: string;
  mimeType?: string;
  createdAt: string;
}

const tipoPersonaMap: Record<string, string> = {
  natural: 'Persona Natural', asociacion: 'Asociación', acfc: 'ACFC', comunidad_etnica: 'Comunidad Étnica',
};

const tipoDocLabel: Record<string, string> = {
  registro_ica: 'Registro ICA', camara_comercio: 'Cámara de Comercio', rut: 'RUT',
  certificacion_bpa: 'Certificación BPA', certificacion_origen_etnico: 'Certificación Origen Étnico',
  certificacion_asociacion: 'Certificación Asociación', otro: 'Otro',
};

export default function DetalleProductorPage() {
  const params = useParams();
  const router = useRouter();
  const [productor, setProductor] = useState<Productor | null>(null);
  const [loading, setLoading] = useState(true);
  const [calificacion, setCalificacion] = useState(0);
  const [savingCalif, setSavingCalif] = useState(false);

  const load = useCallback(async () => {
    try {
      const [prodRes, califRes] = await Promise.all([
        api.get<Productor>(`/rupl/productores/${params.id}`),
        api.get<{ calificacionPromedio: number }>(`/rupl/productores/${params.id}/calificacion`).catch(() => ({ calificacionPromedio: 0 })),
      ]);
      setProductor(prodRes);
      setCalificacion(Number(califRes.calificacionPromedio) || 0);
    } catch {
      setProductor(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const handleCalificar = async (val: number) => {
    setSavingCalif(true);
    try {
      await api.put(`/rupl/productores/${params.id}/calificacion`, { calificacion: val });
      setCalificacion(val);
    } catch {}
    setSavingCalif(false);
  };

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando...</div>;
  if (!productor) return <div className="py-20 text-center text-sm text-red-500">Productor no encontrado</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
          <h1 className="text-xl font-semibold text-slate-800">{productor.razonSocial}</h1>
          <Badge status={productor.estado} />
        </div>
        <Link href={`/dashboard/rupl/${params.id}/editar`}>
          <Button variant="outline" size="sm">✏️ Editar</Button>
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Información General</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Razón Social</dt><dd className="font-medium text-slate-800">{productor.razonSocial}</dd></div>
          <div><dt className="text-slate-400">Nombre Comercial</dt><dd className="font-medium text-slate-800">{productor.nombreComercial || '—'}</dd></div>
          <div><dt className="text-slate-400">Tipo Persona</dt><dd className="font-medium text-slate-800">{tipoPersonaMap[productor.tipoPersona] || productor.tipoPersona}</dd></div>
          <div><dt className="text-slate-400">Documento</dt><dd className="font-medium text-slate-800">{productor.tipoDocumento} {productor.numeroDocumento}</dd></div>
          <div><dt className="text-slate-400">Teléfono</dt><dd className="font-medium text-slate-800">{productor.telefonoContacto || '—'}</dd></div>
          <div><dt className="text-slate-400">Email</dt><dd className="font-medium text-slate-800">{productor.email || '—'}</dd></div>
          <div><dt className="text-slate-400">Departamento / Municipio</dt><dd className="font-medium text-slate-800">{productor.codigoDepartamento} - {productor.codigoMunicipio}</dd></div>
          <div><dt className="text-slate-400">Vereda</dt><dd className="font-medium text-slate-800">{productor.codigoVereda || '—'}</dd></div>
          <div><dt className="text-slate-400">Estrato</dt><dd className="font-medium text-slate-800">{productor.estrato || '—'}</dd></div>
          <div><dt className="text-slate-400">Comunidad Étnica</dt><dd className="font-medium text-slate-800">{productor.esComunidadEtnica ? `Sí (${productor.etnia || ''})` : 'No'}</dd></div>
          <div><dt className="text-slate-400">Registrado</dt><dd className="font-medium text-slate-800">{formatDate(productor.createdAt)}</dd></div>
          <div><dt className="text-slate-400">Actualizado</dt><dd className="font-medium text-slate-800">{formatDate(productor.updatedAt)}</dd></div>
        </dl>
      </div>

      {productor.latitud && productor.longitud && (
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <div className="p-6 pb-3">
            <h2 className="text-sm font-semibold text-slate-700">Ubicación</h2>
            <p className="mt-1 text-xs text-slate-400">{Number(productor.latitud).toFixed(5)}, {Number(productor.longitud).toFixed(5)}</p>
          </div>
          <MapPicker lat={productor.latitud} lng={productor.longitud} readOnly />
        </div>
      )}

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Calificación</h2>
        </div>
        <div className="flex items-center gap-3">
          <StarRating value={calificacion} onChange={handleCalificar} size="lg" />
          <span className="text-lg font-semibold text-slate-700">{calificacion.toFixed(1)}</span>
          {savingCalif && <span className="text-xs text-slate-400">guardando...</span>}
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Productos Ofrecidos</h2>
          <Link href={`/dashboard/rupl/${params.id}/productos/nuevo`}>
            <Button size="sm">+ Agregar</Button>
          </Link>
        </div>
        {(!productor.productos || productor.productos.length === 0) ? (
          <p className="text-sm text-slate-400">No hay productos registrados</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {productor.productos.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.categoria} · {p.volumenDisponible} {p.unidadMedida}</p>
                </div>
                <div className="flex items-center gap-2 text-right text-sm">
                  {p.precioReferencia ? <span className="text-slate-600">{formatCurrency(p.precioReferencia)}</span> : null}
                  <Link href={`/dashboard/rupl/${params.id}/productos/${p.id}/estacionalidad`} className="text-xs text-emerald-600 hover:text-emerald-700">📅</Link>
                  <span className={`inline-block h-2 w-2 rounded-full ${p.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Documentos</h2>
          <Link href={`/dashboard/rupl/${params.id}/documentos/nuevo`}>
            <Button size="sm">+ Adjuntar</Button>
          </Link>
        </div>
        {(!productor.documentos || productor.documentos.length === 0) ? (
          <p className="text-sm text-slate-400">No hay documentos adjuntos</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {productor.documentos.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                    {d.mimeType?.includes('pdf') ? 'PDF' : d.mimeType?.includes('image') ? '🖼' : '📄'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tipoDocLabel[d.tipo] || d.tipo}</p>
                    {d.fechaVencimiento && (
                      <p className="text-xs text-slate-400">Vence: {formatDate(d.fechaVencimiento)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.verificado ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Verificado</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Pendiente</span>
                  )}
                  {d.archivoUrl && (
                    <a href={`http://localhost:3001${d.archivoUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700">Ver</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
