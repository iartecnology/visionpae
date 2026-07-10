'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

interface RuedaNegocio {
  id: string;
  nombre: string;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string | null;
  estado: string;
}

interface DemandaRueda {
  id: string;
  ruedaId: string;
  producto: string;
  cantidad: number;
  unidad: string;
  institucion: string;
}

const estadoColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  programada: 'outline',
  en_curso: 'default',
  finalizada: 'secondary',
  cancelada: 'destructive',
};

export default function RuedasPage() {
  const [ruedas, setRuedas] = useState<RuedaNegocio[]>([]);
  const [demandas, setDemandas] = useState<DemandaRueda[]>([]);
  const [selectedRueda, setSelectedRueda] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRuedas = async () => {
    setLoading(true);
    try {
      const data = await api.get<RuedaNegocio[]>('/ruedas');
      setRuedas(data);
    } catch {
      setError('Error al cargar ruedas');
    } finally {
      setLoading(false);
    }
  };

  const fetchDemandas = async (ruedaId: string) => {
    try {
      const data = await api.get<DemandaRueda[]>(`/ruedas/${ruedaId}/demandas`);
      setDemandas(data);
      setSelectedRueda(ruedaId);
    } catch {
      setError('Error al cargar demandas');
    }
  };

  useEffect(() => { fetchRuedas(); }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      await api.patch(`/ruedas/${id}`, { estado });
      fetchRuedas();
    } catch { setError('Error al actualizar estado'); }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🤝 Ruedas de Negocio</h1>
          <p className="mt-1 text-sm text-slate-500">Organiza encuentros entre productores y compradores</p>
        </div>
        <Link href="/dashboard/ruedas/nueva"><Button>+ Nueva Rueda</Button></Link>
      </div>

      {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-5 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-700">Ruedas</h2>
            </div>
            <Card className="overflow-hidden border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Lugar</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ruedas.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-slate-400">No hay ruedas programadas</TableCell></TableRow>
                    ) : ruedas.map((r) => (
                      <TableRow key={r.id} className={selectedRueda === r.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
                        <TableCell className="font-medium text-slate-800">{r.nombre}</TableCell>
                        <TableCell><Badge variant="outline">{r.tipo}</Badge></TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {new Date(r.fechaInicio).toLocaleDateString('es-CO')} - {new Date(r.fechaFin).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell className="text-slate-500">{r.lugar || 'Virtual'}</TableCell>
                        <TableCell>
                          <select
                            value={r.estado}
                            onChange={(e) => cambiarEstado(r.id, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                          >
                            <option value="programada">Programada</option>
                            <option value="en_curso">En curso</option>
                            <option value="finalizada">Finalizada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => fetchDemandas(r.id)} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Demandas</button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">{selectedRueda ? 'Demandas' : 'Selecciona una rueda'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {selectedRueda ? (
                  <div className="space-y-2">
                    {demandas.length === 0 ? (
                      <p className="text-sm text-slate-400">Sin demandas registradas</p>
                    ) : demandas.map((d) => (
                      <div key={d.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 shadow-sm">
                        <p className="text-sm font-medium text-slate-700">{d.producto}</p>
                        <p className="text-xs text-slate-500">{d.cantidad} {d.unidad} — {d.institucion}</p>
                      </div>
                    ))}
                    <Link href={`/dashboard/ruedas/${selectedRueda}?tab=demandas`} className="block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Gestionar demandas →</Link>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Haz clic en &quot;Demandas&quot; de una rueda</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
