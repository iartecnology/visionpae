'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface ActaDetail {
  id: string;
  estado: string;
  fechaVisita: string;
  geolocalizacion: Record<string, any>;
  itemsVerificados: any[];
  firmaInterventorUrl?: string;
  firmaProductorUrl?: string;
  actaPdfUrl?: string;
  orden: {
    numero: string;
    valorTotal: number;
    productor: { razonSocial: string; numeroDocumento: string };
    items: { id: string; nombreProducto: string; cantidadSolicitada: number; unidadMedida: string; precioUnitario: number; subtotal: number }[];
  };
  interventor: { nombreCompleto: string };
  productor: { razonSocial: string; numeroDocumento: string };
}

export default function ActaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [acta, setActa] = useState<ActaDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<ActaDetail>(`/actas-recibo/${params.id}`);
      setActa(res);
    } catch {
      setActa(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando...</div>;
  if (!acta) return <div className="py-20 text-center text-sm text-red-500">Acta no encontrada</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Acta de Recibo</h1>
          <Badge status={acta.estado} />
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 sm:mb-6 sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 sm:mb-4">Información General</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Orden</dt><dd className="font-medium text-slate-800">#{acta.orden.numero}</dd></div>
          <div><dt className="text-slate-400">Valor Total</dt><dd className="font-medium text-slate-800">{formatCurrency(acta.orden.valorTotal)}</dd></div>
          <div><dt className="text-slate-400">Productor</dt><dd className="font-medium text-slate-800">{acta.productor.razonSocial}</dd></div>
          <div><dt className="text-slate-400">Interventor</dt><dd className="font-medium text-slate-800">{acta.interventor.nombreCompleto}</dd></div>
          <div><dt className="text-slate-400">Fecha Visita</dt><dd className="font-medium text-slate-800">{formatDate(acta.fechaVisita)}</dd></div>
        </dl>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 sm:mb-6 sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700 sm:mb-4">Items de la Orden</h2>

        {/* Desktop table */}
        <table className="hidden w-full text-sm sm:table">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Producto</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Cantidad</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Precio Unit.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {acta.orden.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-50">
                <td className="px-3 py-2 text-slate-800">{item.nombreProducto}</td>
                <td className="px-3 py-2 text-right text-slate-600">{item.cantidadSolicitada} {item.unidadMedida}</td>
                <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(item.precioUnitario)}</td>
                <td className="px-3 py-2 text-right text-slate-800 font-medium">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="flex flex-col gap-2 sm:hidden">
          {acta.orden.items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-800">{item.nombreProducto}</p>
                <p className="text-sm font-semibold text-slate-800">{formatCurrency(item.subtotal)}</p>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{item.cantidadSolicitada} {item.unidadMedida}</span>
                <span className="text-slate-300">×</span>
                <span>{formatCurrency(item.precioUnitario)}/{item.unidadMedida}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {acta.itemsVerificados && acta.itemsVerificados.length > 0 && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 sm:mb-6 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 sm:mb-4">Items Verificados</h2>
          <pre className="text-xs text-slate-500">{JSON.stringify(acta.itemsVerificados, null, 2)}</pre>
        </div>
      )}

      {(acta.firmaInterventorUrl || acta.firmaProductorUrl || acta.actaPdfUrl) && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 sm:mb-4">Documentos</h2>
          <div className="space-y-2 text-sm">
            {acta.firmaInterventorUrl && <p><a href={acta.firmaInterventorUrl} target="_blank" className="text-emerald-600 hover:underline">Firma del Interventor</a></p>}
            {acta.firmaProductorUrl && <p><a href={acta.firmaProductorUrl} target="_blank" className="text-emerald-600 hover:underline">Firma del Productor</a></p>}
            {acta.actaPdfUrl && <p><a href={acta.actaPdfUrl} target="_blank" className="text-emerald-600 hover:underline">Acta PDF</a></p>}
          </div>
        </div>
      )}
    </div>
  );
}
