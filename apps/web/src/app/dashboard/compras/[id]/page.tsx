'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/badge';

interface OrdenDetail {
  id: string;
  numero: string;
  estado: string;
  valorTotal: number;
  esLocal: boolean;
  fundamentoLegal?: string;
  fechaEmision: string;
  fechaEntregaProgramada: string;
  productor: { razonSocial: string; numeroDocumento: string; codigoMunicipio: string };
  items: { id: string; nombreProducto: string; cantidadSolicitada: number; unidadMedida: string; precioUnitario: number; subtotal: number }[];
  createdAt: string;
}

export default function OrdenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [orden, setOrden] = useState<OrdenDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get<OrdenDetail>(`/compras/ordenes/${params.id}`);
      setOrden(res);
    } catch {
      setOrden(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Cargando...</div>;
  if (!orden) return <div className="py-20 text-center text-sm text-red-500">Orden no encontrada</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">&larr; Volver</button>
        <h1 className="text-xl font-semibold text-slate-800">Orden {orden.numero}</h1>
        <Badge status={orden.estado} />
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Información General</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-400">Productor</dt><dd className="font-medium text-slate-800">{orden.productor.razonSocial}</dd></div>
          <div><dt className="text-slate-400">Documento</dt><dd className="font-medium text-slate-800">{orden.productor.numeroDocumento}</dd></div>
          <div><dt className="text-slate-400">Municipio</dt><dd className="font-medium text-slate-800">{orden.productor.codigoMunicipio}</dd></div>
          <div><dt className="text-slate-400">Compra Local</dt><dd className="font-medium text-slate-800">{orden.esLocal ? 'Sí' : 'No'}</dd></div>
          <div><dt className="text-slate-400">Fecha de Emisión</dt><dd className="font-medium text-slate-800">{formatDate(orden.fechaEmision)}</dd></div>
          <div><dt className="text-slate-400">Fecha de Entrega</dt><dd className="font-medium text-slate-800">{formatDate(orden.fechaEntregaProgramada)}</dd></div>
          <div className="col-span-2"><dt className="text-slate-400">Fundamento Legal</dt><dd className="font-medium text-slate-800">{orden.fundamentoLegal || '—'}</dd></div>
        </dl>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
              <th className="pb-2">Producto</th>
              <th className="pb-2">Cantidad</th>
              <th className="pb-2">U/M</th>
              <th className="pb-2">Precio Unit.</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orden.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-slate-800">{item.nombreProducto}</td>
                <td className="py-2 text-slate-600">{item.cantidadSolicitada}</td>
                <td className="py-2 text-slate-600">{item.unidadMedida}</td>
                <td className="py-2 text-slate-600">{formatCurrency(item.precioUnitario)}</td>
                <td className="py-2 text-right font-medium text-slate-800">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={4} className="py-2 text-right text-sm font-semibold text-slate-800">Total</td>
              <td className="py-2 text-right text-sm font-bold text-slate-800">{formatCurrency(orden.valorTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
