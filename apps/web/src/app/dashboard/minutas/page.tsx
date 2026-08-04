'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Receta {
  id: string;
  nombre: string;
  tipoComida: string;
  tiempoEstimado: number;
  porciones: number;
  activo: boolean;
}

interface PlanSemanal {
  id: string;
  semana: number;
  anio: number;
  descripcion: string;
  activo: boolean;
}

type Tab = 'recetas' | 'planes';

export default function MinutasPage() {
  const [tab, setTab] = useState<Tab>('recetas');
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [planes, setPlanes] = useState<PlanSemanal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'recetas') {
        const data = await api.get<Receta[]>('/recetas');
        setRecetas(data);
      } else {
        const data = await api.get<PlanSemanal[]>('/planes-semanales');
        setPlanes(data);
      }
    } catch {
      setError(`Error al cargar ${tab === 'recetas' ? 'recetas' : 'planes'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const toggleReceta = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/recetas/${id}`, { activo: !activo });
      fetchData();
    } catch { setError('Error al actualizar receta'); }
  };

  const Tabs = () => (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      <button onClick={() => setTab('recetas')} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === 'recetas' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Recetas</button>
      <button onClick={() => setTab('planes')} className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${tab === 'planes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Planes Semanales</button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">🍽️ Minutas</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Gestión de recetas y planes semanales</p>
        </div>
        <Link href={tab === 'recetas' ? '/dashboard/minutas/recetas/nueva' : '/dashboard/minutas/planes/nuevo'}>
          <Button className="w-full sm:w-auto">+ Nueva {tab === 'recetas' ? 'Receta' : 'Plan'}</Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs />

      {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : tab === 'recetas' ? (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Card className="overflow-hidden border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tiempo</TableHead>
                      <TableHead>Porciones</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recetas.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-slate-400">No hay recetas. ¡Crea la primera!</TableCell></TableRow>
                    ) : recetas.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-slate-800">{r.nombre}</TableCell>
                        <TableCell className="text-slate-500">{r.tipoComida}</TableCell>
                        <TableCell className="text-slate-500">{r.tiempoEstimado} min</TableCell>
                        <TableCell className="text-slate-500">{r.porciones}</TableCell>
                        <TableCell>
                          <button onClick={() => toggleReceta(r.id, r.activo)}>
                            <Badge variant={r.activo ? 'default' : 'secondary'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/minutas/recetas/${r.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Ver</Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {recetas.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
                No hay recetas. ¡Crea la primera!
              </div>
            ) : (
              recetas.map((r) => (
                <Link key={r.id} href={`/dashboard/minutas/recetas/${r.id}`}>
                  <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{r.nombre}</p>
                      <button
                        onClick={(e) => { e.preventDefault(); toggleReceta(r.id, r.activo); }}
                        className="shrink-0"
                      >
                        <Badge variant={r.activo ? 'default' : 'secondary'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </button>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400">🍽️</span>
                        <span>{r.tipoComida}</span>
                        <span className="text-slate-300">·</span>
                        <span>{r.tiempoEstimado} min</span>
                        <span className="text-slate-300">·</span>
                        <span>{r.porciones} porciones</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Card className="overflow-hidden border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Semana</TableHead>
                      <TableHead>Año</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planes.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-slate-400">No hay planes semanales</TableCell></TableRow>
                    ) : planes.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-slate-800">Semana {p.semana}</TableCell>
                        <TableCell className="text-slate-500">{p.anio}</TableCell>
                        <TableCell className="text-slate-500">{p.descripcion}</TableCell>
                        <TableCell><Badge variant={p.activo ? 'default' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                        <TableCell>
                          <Link href={`/dashboard/minutas/planes/${p.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Ver</Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {planes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">
                No hay planes semanales
              </div>
            ) : (
              planes.map((p) => (
                <Link key={p.id} href={`/dashboard/minutas/planes/${p.id}`}>
                  <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] transition-all hover:border-emerald-200 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">Semana {p.semana} - {p.anio}</p>
                      <Badge variant={p.activo ? 'default' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <p className="text-slate-600">{p.descripcion}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}