'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

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
}

interface Oferta {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  precioReferencia: number | null;
  atributos: Record<string, string> | null;
  certificaciones: string[];
  productor: {
    id: string;
    razonSocial: string;
    nombreComercial: string | null;
    codigoMunicipio: string | null;
    calificacionPromedio: number | null;
  };
}

const categoriaLabels: Record<string, string> = {
  fruta: 'Fruta', verdura: 'Verdura', hortaliza: 'Hortaliza', tuberculos: 'Tubérculo',
  lacteo: 'Lácteo', carnes: 'Carnes', granos: 'Granos', panaderia: 'Panadería',
  preparaciones: 'Preparación', bebidas: 'Bebida', huevos: 'Huevos', miel: 'Miel',
  procesado: 'Procesado', otros: 'Otros',
};

export default function DetalleProductoBasePage() {
  const params = useParams<{ baseId: string }>();
  const router = useRouter();
  const [base, setBase] = useState<ProductoBase | null>(null);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pb, of] = await Promise.all([
        api.get<ProductoBase>(`/catalogo/productos/${params.baseId}`),
        api.get<{ data: Oferta[] }>(`/rupl/productores/productos/buscar?productoBaseId=${params.baseId}&limit=100`),
      ]);
      setBase(pb);
      setOfertas(of.data || []);
    } catch {
      setError('No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [params.baseId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;
  }

  if (error || !base) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
        {error || 'Producto no encontrado'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">← Volver al catálogo</button>

      {/* Header plantilla */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          {base.fotoUrl ? (
            <img src={base.fotoUrl} alt={base.nombre} className="h-28 w-28 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-4xl">🛒</div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                {categoriaLabels[base.categoria] || base.categoria}
              </span>
              <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                {ofertas.length} oferente{ofertas.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-800">{base.nombre}</h1>
            <p className="mt-1 text-sm text-slate-500">Unidad por defecto: {base.unidadMedidaDefecto || '—'}</p>
            {(base.codigoUnspsc || base.codigoSipsa) && (
              <p className="mt-1 font-mono text-xs text-slate-400">
                {base.codigoUnspsc && <>UNSPSC {base.codigoUnspsc}</>}
                {base.codigoUnspsc && base.codigoSipsa && ' · '}
                {base.codigoSipsa && <>SIPSA {base.codigoSipsa}</>}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 px-4 py-3 sm:px-5">
          {base.atributosSchema && Object.entries(base.atributosSchema).length > 0 && (
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">Características:</span>{' '}
              {Object.entries(base.atributosSchema).map(([k, v]) => `${k}: ${v.join(' | ')}`).join('  ·  ')}
            </div>
          )}
          {base.certificacionesRequeridas?.length > 0 && (
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">Certificaciones requeridas:</span>{' '}
              {base.certificacionesRequeridas.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Ofertas */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-700">Productores que ofrecen {base.nombre}</h2>
        {ofertas.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
            Aún no hay productores ofreciendo este producto
          </div>
        ) : (
          <div className="space-y-3">
            {ofertas.map((o) => (
              <div key={o.id} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-800">{o.productor.razonSocial}</h3>
                      {o.productor.nombreComercial && (
                        <span className="text-xs text-slate-400">({o.productor.nombreComercial})</span>
                      )}
                      {o.productor.calificacionPromedio != null && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-600">
                          ⭐ {Number(o.productor.calificacionPromedio).toFixed(1)}
                        </span>
                      )}
                    </div>
                    {o.productor.codigoMunicipio && (
                      <p className="mt-0.5 text-xs text-slate-400">📍 {o.productor.codigoMunicipio}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      {o.volumenDisponible} {o.unidadMedida} disponibles
                    </p>
                    {o.atributos && Object.entries(o.atributos).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {Object.entries(o.atributos).map(([k, v]) => (
                          <span key={k} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">
                            {k}: <strong>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    {o.precioReferencia != null ? (
                      <p className="text-lg font-bold text-emerald-700">
                        {formatCurrency(o.precioReferencia)}<span className="text-xs font-medium text-slate-400">/{o.unidadMedida}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Precio a convenir</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
