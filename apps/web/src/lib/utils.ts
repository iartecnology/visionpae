import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const statusColorMap: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  aprobado: 'bg-green-100 text-green-800 border-green-200',
  rechazado: 'bg-red-100 text-red-800 border-red-200',
  entregada: 'bg-blue-100 text-blue-800 border-blue-200',
  activo: 'bg-green-100 text-green-800 border-green-200',
  inactivo: 'bg-gray-100 text-gray-800 border-gray-200',
  programada: 'bg-blue-100 text-blue-800 border-blue-200',
  en_curso: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  finalizada: 'bg-green-100 text-green-800 border-green-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
  abierta: 'bg-red-100 text-red-800 border-red-200',
  en_gestion: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resuelta: 'bg-green-100 text-green-800 border-green-200',
  cerrada: 'bg-gray-100 text-gray-800 border-gray-200',
  borrador: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabelMap: Record<string, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  entregada: 'Entregada',
  activo: 'Activo',
  inactivo: 'Inactivo',
  programada: 'Programada',
  en_curso: 'En Curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
  abierta: 'Abierta',
  en_gestion: 'En Gestión',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
  borrador: 'Borrador',
};

export function statusColor(status: string): string {
  return statusColorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function statusLabel(status: string): string {
  return statusLabelMap[status] || status;
}
