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
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)] sm:p-5">
        <h1 className="text-lg font-bold text-slate-800 sm:text-xl">Gestión de Roles y Permisos</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Selecciona un rol y asigna los permisos disponibles</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Role selector */}
        <div className="w-full shrink-0 lg:w-56">
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selectedRole === role.id
                    ? 'bg-emerald-50 font-medium text-emerald-700 ring-1 ring-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                <span className="block text-xs font-medium">{role.nombre}</span>
                <span className="block text-[10px] text-slate-400">{role.codigo}</span>
              </button>
            ))}
          </div>

          {/* Desktop: vertical list */}
          <div className="hidden space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:block">
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

              {/* Desktop: full matrix table */}
              <div className="hidden overflow-x-auto lg:block">
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

              {/* Mobile: accordion by resource */}
              <div className="lg:hidden">
                {groups.map((group) => {
                  const groupPerms = group.permisos.filter((p) => p.accion !== 'exportar');
                  const allSelected = groupPerms.every((p) => selectedPermIds.has(p.id));
                  const isExpanded = expandedGroup === group.recurso;
                  return (
                    <div key={group.recurso} className="border-b border-slate-50 last:border-b-0">
                      <button
                        onClick={() => setExpandedGroup(isExpanded ? null : group.recurso)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleGroup(group.recurso); }}
                            disabled={selectedRoleData?.esSistema}
                            className="flex items-center gap-2"
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
                          </button>
                          <span className="text-sm font-medium capitalize text-slate-700">{group.recurso.replace(/_/g, ' ')}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                            {groupPerms.filter((p) => selectedPermIds.has(p.id)).length}/{groupPerms.length}
                          </span>
                        </div>
                        <svg className={cn('h-4 w-4 text-slate-400 transition-transform', isExpanded && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                          {groupPerms.map((perm) => {
                            const checked = selectedPermIds.has(perm.id);
                            return (
                              <button
                                key={perm.id}
                                onClick={() => togglePermission(perm.id)}
                                disabled={selectedRoleData?.esSistema}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                                  checked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600',
                                )}
                              >
                                <div className={cn(
                                  'h-3.5 w-3.5 shrink-0 rounded border-2 transition-colors',
                                  checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300',
                                )}>
                                  {checked && (
                                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span>{ACCION_LABELS[perm.accion] || perm.accion}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}