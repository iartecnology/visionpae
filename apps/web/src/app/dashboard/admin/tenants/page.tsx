'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Tenant {
  id: string;
  nombre: string;
  tipo: string;
  codigoMunicipio: string | null;
  activo: boolean;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: 'municipio', codigoMunicipio: '' });

  const fetchTenants = async () => {
    try {
      const data = await api.get<Tenant[]>('/admin/tenants');
      setTenants(data);
    } catch {
      setError('Error al cargar entidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const crear = async () => {
    try {
      await api.post('/admin/tenants', form);
      setShowForm(false);
      setForm({ nombre: '', tipo: 'municipio', codigoMunicipio: '' });
      fetchTenants();
    } catch { setError('Error al crear entidad'); }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/admin/tenants/${id}`, { activo: !activo });
      fetchTenants();
    } catch { setError('Error al actualizar entidad'); }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">🏛️ Administración de Entidades</h1>
          <p className="mt-1 text-sm text-slate-500">Gestión global de tenants (solo super_admin)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>+ Nueva Entidad</Button>
      </div>

      {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {showForm && (
        <Card className="border-slate-200/60 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Nueva Entidad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400">
              <option value="municipio">Municipio</option>
              <option value="gobernacion">Gobernación</option>
              <option value="icbf">ICBF</option>
              <option value="hospital">Hospital</option>
              <option value="operador_pae">Operador PAE</option>
              <option value="secretaria_educacion">Secretaría Educación</option>
            </select>
            <Input placeholder="Código Municipio (opcional)" value={form.codigoMunicipio} onChange={(e) => setForm({ ...form, codigoMunicipio: e.target.value })} />
          </div>
          <Button onClick={crear} className="mt-3">Guardar</Button>
        </Card>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <Card className="overflow-hidden border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-400">No hay entidades</TableCell></TableRow>
                ) : tenants.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-slate-800">{t.nombre}</TableCell>
                    <TableCell><Badge variant="outline">{t.tipo}</Badge></TableCell>
                    <TableCell className="text-slate-500">{t.codigoMunicipio || '-'}</TableCell>
                    <TableCell>
                      <button onClick={() => toggleActivo(t.id, t.activo)}><Badge variant={t.activo ? 'default' : 'secondary'}>{t.activo ? 'Activo' : 'Inactivo'}</Badge></button>
                    </TableCell>
                    <TableCell>
                      <a href={`/dashboard/admin/usuarios?tenantId=${t.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Ver</a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
