'use client';

import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">👤 Administración de Usuarios</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">{tenantFilter ? 'Usuarios de entidad específica' : 'Todos los usuarios del sistema (solo super_admin)'}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">+ Nuevo Usuario</Button>
      </div>

      {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {showForm && (
        <Card className="border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Nuevo Usuario</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <Button onClick={crear} className="mt-3 w-full sm:w-auto">Guardar</Button>
        </Card>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:block">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Entidad</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Rol</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Último Acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">No hay usuarios</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.nombreCompleto}</td>
                      <td className="px-4 py-3 text-slate-500">{u.email}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{u.tenant?.nombre || '-'}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{u.rol.replace(/_/g, ' ')}</Badge></td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActivo(u.id, u.activo)}><Badge variant={u.activo ? 'default' : 'secondary'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge></button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-CO') : 'Nunca'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {users.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay usuarios</div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{u.nombreCompleto}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{u.email}</p>
                    </div>
                    <button onClick={() => toggleActivo(u.id, u.activo)}>
                      <Badge variant={u.activo ? 'default' : 'secondary'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">{u.rol.replace(/_/g, ' ')}</Badge>
                    {u.tenant?.nombre && <span className="text-slate-400">·</span>}
                    {u.tenant?.nombre && <span className="text-slate-500">{u.tenant.nombre}</span>}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Último acceso: {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-CO') : 'Nunca'}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
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