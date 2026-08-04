'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
    <div className="space-y-4 sm:space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-bold text-slate-800 sm:text-xl">🏛️ Administración de Entidades</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Gestión global de tenants (solo super_admin)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">+ Nueva Entidad</Button>
      </div>

      {error && <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {showForm && (
        <Card className="border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)] sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Nueva Entidad</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Municipio</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No hay entidades</td></tr>
                  ) : tenants.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{t.nombre}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{t.tipo}</Badge></td>
                      <td className="px-4 py-3 text-slate-500">{t.codigoMunicipio || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActivo(t.id, t.activo)}><Badge variant={t.activo ? 'default' : 'secondary'}>{t.activo ? 'Activo' : 'Inactivo'}</Badge></button>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/dashboard/admin/usuarios?tenantId=${t.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Ver</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {tenants.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">No hay entidades</div>
            ) : (
              tenants.map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.nombre}</p>
                      <Badge variant="outline" className="mt-1">{t.tipo}</Badge>
                    </div>
                    <button onClick={() => toggleActivo(t.id, t.activo)}>
                      <Badge variant={t.activo ? 'default' : 'secondary'}>{t.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    <p><span className="text-slate-400">Municipio:</span> {t.codigoMunicipio || '-'}</p>
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <a href={`/dashboard/admin/usuarios?tenantId=${t.id}`} className="inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700">
                      Ver usuarios →
                    </a>
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