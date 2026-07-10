'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: string;
  activo: boolean;
  ultimoAcceso: string | null;
}

interface FeatureFlag {
  flag: string;
  habilitado: boolean;
}

export default function ConfigPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [userData, flagData] = await Promise.all([
          api.get<User[]>('/admin/usuarios'),
          api.get<FeatureFlag[]>('/feature-flags').catch(() => null),
        ]);
        setUsers(userData);
        setFlags(flagData ?? []);
      } catch {
        setError('No se pudieron cargar los datos de configuración');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400 shadow-sm">Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
        <h1 className="text-xl font-bold text-slate-800">⚙️ Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">Administración de la entidad y usuarios</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">Usuarios de la Entidad</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400">No hay usuarios</TableCell>
                </TableRow>
              ) : users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-slate-800">{u.nombreCompleto}</TableCell>
                  <TableCell className="text-slate-500">{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.rol.replace(/_/g, ' ')}</Badge></TableCell>
                  <TableCell>
                    <span className={`inline-block h-2 w-2 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-red-400'}`} />
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

      {flags.length > 0 && (
        <Card className="border-slate-200/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.06)]">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Módulos y Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {flags.map((f) => (
              <div key={f.flag} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 shadow-sm">
                <span className="text-sm font-medium text-slate-700">{f.flag.replace('modulo_', 'Módulo ').replace(/_/g, ' ')}</span>
                <Badge variant={f.habilitado ? 'default' : 'secondary'}>
                  {f.habilitado ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
