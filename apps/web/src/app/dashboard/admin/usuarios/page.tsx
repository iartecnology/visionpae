'use client';

import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
  ultimoAcceso: string | null;
  tenant: { nombre: string } | null;
}

function UsuariosContent() {
  const searchParams = useSearchParams();
  const tenantFilter = searchParams.get('tenantId');

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', password: 'Cambiar123!', nombreCompleto: '', rol: 'operador', tenantId: tenantFilter || '' });

  const fetchUsers = async () => {
    try {
      const path = tenantFilter ? `/admin/usuarios?tenantId=${tenantFilter}` : '/admin/usuarios';
      const data = await api.get<User[]>(path);
      setUsers(data);
    } catch (e: any) {
      setError('Error al cargar usuarios: ' + (e?.message || 'desconocido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [tenantFilter]);

  const crear = async () => {
    try {
      await api.post('/admin/usuarios', form);
      setShowForm(false);
      setForm({ email: '', password: 'Cambiar123!', nombreCompleto: '', rol: 'operador', tenantId: tenantFilter || '' });
      fetchUsers();
    } catch { setError('Error al crear usuario'); }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await api.patch(`/admin/usuarios/${id}`, { activo: !activo });
      fetchUsers();
    } catch { setError('Error al actualizar usuario'); }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <div>
          <h1 className="text-xl font-bold text-slate-800">👤 Administración de Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">{tenantFilter ? 'Usuarios de entidad específica' : 'Todos los usuarios del sistema (solo super_admin)'}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>+ Nuevo Usuario</Button>
      </div>

      {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {showForm && (
        <Card className="border-slate-200/60 bg-white p-5 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Nuevo Usuario</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nombre completo" value={form.nombreCompleto} onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400">
              <option value="admin_entidad">Admin Entidad</option>
              <option value="operador">Operador</option>
              <option value="interventor">Interventor</option>
              <option value="auditor">Auditor</option>
              <option value="mesa_tecnica">Mesa Técnica</option>
              <option value="productor">Productor</option>
            </select>
            {!tenantFilter && (
              <Input placeholder="ID de tenant (UUID)" value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} />
            )}
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
                  <TableHead>Email</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-slate-400">No hay usuarios</TableCell></TableRow>
                ) : users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-slate-800">{u.nombreCompleto}</TableCell>
                    <TableCell className="text-slate-500">{u.email}</TableCell>
                    <TableCell className="text-xs text-slate-500">{u.tenant?.nombre || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{u.rol.replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell>
                      <button onClick={() => toggleActivo(u.id, u.activo)}><Badge variant={u.activo ? 'default' : 'secondary'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge></button>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-CO') : 'Nunca'}
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

export default function AdminUsuariosPage() {
  return (
    <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>}>
      <UsuariosContent />
    </Suspense>
  );
}
