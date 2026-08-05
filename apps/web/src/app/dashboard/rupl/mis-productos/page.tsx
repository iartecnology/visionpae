'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProductoOfrecido {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  volumenDisponible: number;
  precioReferencia: number | null;
  activo: boolean;
  estadoOferta: string;
  createdAt: string;
  fotos: string[];
  presentaciones: {
    id: string;
    nombre: string;
    volumen: number;
    unidadMedida: string;
    precio: number;
    stock: number;
  }[];
}

const categoriaEmoji: Record<string, string> = {
  fruta: '🍎', verdura: '🥬', hortaliza: '🥕', tuberculos: '🥔',
  granos: '🌾', lacteo: '🥛', carnes: '🥩', huevos: '🥚',
  miel: '🍯', panaderia: '🍞', preparaciones: '🍲', bebidas: '🥤',
  procesado: '🏭', otros: '📦',
};

export default function MisProductosPage() {
  const router = useRouter();
  const [data, setData] = useState<ProductoOfrecido[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: ProductoOfrecido[]; meta: { total: number } }>(
        '/rupl/productores/mis-productos?limit=100'
      );
      setData(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    setEliminando(id);
    try {
      await api.delete(`/rupl/productores/mis-productos/${id}`);
      setData((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      alert('Error al eliminar producto');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mis Productos</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona tus productos ofertados — {total} producto{total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => router.push('/dashboard/rupl/mis-productos/nuevo')} className="w-full sm:w-auto">
          + Nuevo Producto
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">Aún no tienes productos registrados</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/rupl/mis-productos/nuevo')}>
            Crear mi primer producto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg">
              <div className="mb-2 flex items-start justify-between">
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase text-emerald-700">
                  {categoriaEmoji[p.categoria] || '📦'} {p.categoria}
                </span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                  p.estadoOferta === 'aprobado' ? 'bg-emerald-50 text-emerald-700' :
                  p.estadoOferta === 'rechazado' ? 'bg-red-50 text-red-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {p.estadoOferta}
                </span>
              </div>
              {p.fotos?.length > 0 && (
                <div className="relative mb-3 h-40 w-full overflow-hidden rounded-lg bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.fotos[0]} alt={p.nombre} className="h-full w-full object-cover" />
                </div>
              )}
              <h3 className="text-base font-semibold text-slate-800">{p.nombre}</h3>
              <p className="text-xs text-slate-400">
                {p.volumenDisponible} {p.unidadMedida} disponibles
              </p>
              {p.precioReferencia && (
                <p className="mt-1 text-sm font-bold text-emerald-700">{formatCurrency(p.precioReferencia)}/{p.unidadMedida}</p>
              )}
              {p.presentaciones.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.presentaciones.map((pres) => (
                    <span key={pres.id} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {pres.nombre} — {formatCurrency(pres.precio)}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => router.push(`/dashboard/rupl/mis-productos/editar?id=${p.id}`)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  disabled={eliminando === p.id}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {eliminando === p.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
