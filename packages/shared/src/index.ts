export interface UserPayload {
  id: string;
  tenantId: string;
  email: string;
  nombreCompleto: string;
  rol: UserRole;
}

export type UserRole =
  | 'admin_entidad'
  | 'operador'
  | 'productor'
  | 'interventor'
  | 'auditor'
  | 'mesa_tecnica';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
