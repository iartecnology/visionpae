import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'permisos';

export const RequirePermiso = (recurso: string, accion: string) =>
  SetMetadata(PERMISOS_KEY, [`${recurso}:${accion}`]);

export const RequirePermisos = (...permisos: string[]) =>
  SetMetadata(PERMISOS_KEY, permisos);
