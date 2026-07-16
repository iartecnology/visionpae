'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Permission {
  id: string;
  codigo: string;
  recurso: string;
  accion: string;
  nombre: string;
}

interface PermissionGroup {
  recurso: string;
  permisos: Permission[];
}

interface RolePermission {
  permissionId: string;
  permission: Permission;
}

interface Role {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  esSistema: boolean;
  permissions: RolePermission[];
}

const ACCIONES = ['consultar', 'crear', 'editar', 'eliminar', 'exportar'];
const ACCION_LABELS: Record<string, string> = {
  consultar: 'Ver', crear: 'Crear', editar: 'Editar', eliminar: 'Eliminar', exportar: 'Exportar',
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        api.get<Role[]>('/admin/roles'),
        api.get<PermissionGroup[]>('/admin/permissions'),
      ]);
      setRoles(rolesData);
      setGroups(permsData);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedRoleData = roles.find((r) => r.id === selectedRole);
  const selectedPermIds = new Set(selectedRoleData?.permissions.map((rp) => rp.permissionId) ?? []);

  const togglePermission = async (permId: string) => {
    if (!selectedRoleData || selectedRoleData.esSistema) return;
    setSaving(true);
    const newPermIds = selectedPermIds.has(permId)
      ? selectedRoleData.permissions.filter((rp) => rp.permissionId !== permId).map((rp) => rp.permissionId)
      : [...selectedRoleData.permissions.map((rp) => rp.permissionId), permId];

    try {
      const updated = await api.patch<Role>(`/admin/roles/${selectedRole}`, { permissionIds: newPermIds });
      setRoles((prev) => prev.map((r) => (r.id === selectedRole ? updated : r)));
    } catch { /* ignore */ }
    setSaving(false);
  };

  const toggleGroup = async (recurso: string) => {
    if (!selectedRoleData || selectedRoleData.esSistema) return;
    const groupPerms = groups.find((g) => g.recurso === recurso)?.permisos ?? [];
    const allSelected = groupPerms.every((p) => selectedPermIds.has(p.id));
    const newPermIds = allSelected
      ? selectedRoleData.permissions.filter((rp) => !groupPerms.some((gp) => gp.id === rp.permissionId)).map((rp) => rp.permissionId)
      : [...selectedRoleData.permissions.map((rp) => rp.permissionId), ...groupPerms.filter((gp) => !selectedPermIds.has(gp.id)).map((gp) => gp.id)];

    setSaving(true);
    try {
      const updated = await api.patch<Role>(`/admin/roles/${selectedRole}`, { permissionIds: newPermIds });
      setRoles((prev) => prev.map((r) => (r.id === selectedRole ? updated : r)));
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">Gestión de Roles y Permisos</h1>
        <p className="mt-1 text-sm text-slate-500">Selecciona un rol y asigna los permisos disponibles</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Role selector */}
        <div className="w-full shrink-0 lg:w-56">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  selectedRole === role.id
                    ? 'bg-emerald-50 font-medium text-emerald-700 ring-1 ring-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                <span className="block text-sm font-medium">{role.nombre}</span>
                <span className="block text-xs text-slate-400">{role.codigo}{role.esSistema ? ' · Sistema' : ''}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions matrix */}
        <div className="flex-1">
          {!selectedRole ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400">
              Selecciona un rol para gestionar sus permisos
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">{selectedRoleData?.nombre}</h2>
                    <p className="text-xs text-slate-400">{selectedRoleData?.descripcion}</p>
                  </div>
                  {saving && <span className="text-xs text-slate-400">Guardando...</span>}
                  {selectedRoleData?.esSistema && (
                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">Rol del sistema (solo lectura)</span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="sticky left-0 bg-white px-4 py-2.5 text-left text-xs font-medium text-slate-500">Recurso</th>
                      {ACCIONES.filter((a) => a !== 'exportar' || groups.some((g) => g.permisos.some((p) => p.accion === 'exportar'))).map((accion) => (
                        <th key={accion} className="px-3 py-2.5 text-center text-xs font-medium text-slate-500">{ACCION_LABELS[accion]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => {
                      const groupPerms = group.permisos.filter((p) => p.accion !== 'exportar');
                      const allSelected = groupPerms.every((p) => selectedPermIds.has(p.id));
                      return (
                        <tr key={group.recurso} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="sticky left-0 bg-white px-4 py-3">
                            <button
                              onClick={() => toggleGroup(group.recurso)}
                              disabled={selectedRoleData?.esSistema}
                              className="flex items-center gap-2 text-left"
                            >
                              <div className={cn(
                                'h-4 w-4 rounded border-2 transition-colors',
                                allSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300',
                              )}>
                                {allSelected && (
                                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-medium capitalize text-slate-700">{group.recurso.replace(/_/g, ' ')}</span>
                            </button>
                          </td>
                          {groupPerms.map((perm) => {
                            const checked = selectedPermIds.has(perm.id);
                            return (
                              <td key={perm.id} className="px-3 py-3 text-center">
                                <button
                                  onClick={() => togglePermission(perm.id)}
                                  disabled={selectedRoleData?.esSistema}
                                  className={cn(
                                    'mx-auto h-5 w-5 rounded border-2 transition-colors',
                                    checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300',
                                  )}
                                >
                                  {checked && (
                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
