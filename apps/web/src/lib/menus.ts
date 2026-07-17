'use client';

import {
  LayoutDashboard,
  Map,
  Package,
  Users,
  ShoppingCart,
  FileCheck,
  ScrollText,
  Handshake,
  AlertTriangle,
  ClipboardCheck,
  Bell,
  BarChart3,
  Settings,
  Building,
  UserCog,
  Shield,
  Smartphone,
} from 'lucide-react';

export interface MenuItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  recurso?: string;
  featureFlag?: string;
  children?: MenuItem[];
}

export const menuDefs: MenuItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, recurso: 'dashboard' },
  { label: 'Explorar', href: '/dashboard/explorar', icon: Map },
  { label: 'Catálogo', href: '/dashboard/catalogo', icon: Package, recurso: 'catalogo' },
  { label: 'RUPL Productores', href: '/dashboard/rupl', icon: Users, recurso: 'rupl' },
  { label: 'Compras', href: '/dashboard/compras', icon: ShoppingCart, recurso: 'compras' },
  { label: 'Certificaciones', href: '/dashboard/certificaciones', icon: FileCheck, recurso: 'certificaciones' },
  { label: 'Minutas', href: '/dashboard/minutas', icon: ScrollText, recurso: 'minutas' },
  { label: 'Ruedas', href: '/dashboard/ruedas', icon: Handshake, recurso: 'ruedas' },
  { label: 'Incidencias', href: '/dashboard/incidencias', icon: AlertTriangle, recurso: 'incidencias' },
  { label: 'Actas Recibo', href: '/dashboard/actas-recibo', icon: ClipboardCheck, recurso: 'actas_recibo' },
  { label: 'Notificaciones', href: '/dashboard/notificaciones', icon: Bell, recurso: 'notificaciones' },
  { label: 'Reportes', href: '/dashboard/reportes', icon: BarChart3, recurso: 'reportes' },
  { label: 'Configuración', href: '/dashboard/configuracion', icon: Settings, recurso: 'configuracion', featureFlag: 'configuracion' },
];

export const adminMenuItems: MenuItem[] = [
  { label: 'Catálogo Base', href: '/dashboard/admin/catalogo', icon: Package, recurso: 'catalogo' },
  { label: 'Entidades', href: '/dashboard/admin/tenants', icon: Building, recurso: 'tenants' },
  { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: UserCog, recurso: 'usuarios' },
  { label: 'Roles', href: '/dashboard/admin/roles', icon: Shield, recurso: 'roles' },
  { label: 'Feature Flags', href: '/dashboard/admin/feature-flags', icon: Smartphone, recurso: 'configuracion' },
];
