'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notification-bell';
import { SWRegister } from '@/components/sw-register';
import { OfflineIndicator } from '@/components/offline-indicator';
import { menuDefs, adminMenuItems, MenuItem } from '@/lib/menus';
import { useApiGet } from '@/lib/swr-api';

function adjustColor(hex: string, amount: number): string {
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function hexToRgb(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function applyTenantColors(primaryColor: string) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--tenant-primary', primaryColor);
  root.style.setProperty('--tenant-primary-hover', adjustColor(primaryColor, -20));
  root.style.setProperty('--tenant-primary-light', adjustColor(primaryColor, 50));
  root.style.setProperty('--tenant-primary-bg', adjustColor(primaryColor, 90));
  root.style.setProperty('--tenant-primary-rgb', hexToRgb(primaryColor));
  root.style.setProperty('--tenant-primary-foreground', '#ffffff');
  root.style.setProperty('--tenant-gradient-mid', adjustColor(primaryColor, -25));
  root.style.setProperty('--tenant-gradient-end', adjustColor(primaryColor, -50));
}

try {
  const cached = localStorage.getItem('tenantConfig');
  if (cached) {
    const config = JSON.parse(cached);
    if (config.primaryColor) {
      applyTenantColors(config.primaryColor);
    }
  }
} catch { /* ignore */ }

function SidebarLink({ item, pathname, onNavigate }: { item: MenuItem; pathname: string; onNavigate: () => void }) {
  if (!item.href) return null;
  const isActive = pathname.startsWith(item.href);
  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
        isActive
          ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
          : 'text-white/50 hover:bg-white/10 hover:text-white'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [tenantName, setTenantName] = useState('');

  const { data: meData } = useApiGet<{
    user: { id: string; email: string; nombreCompleto: string; role: { id: string; codigo: string; nombre: string } | null };
    permissions: string[];
    tenant: { id: string; nombre: string; slug: string; logoUrl: string | null; config: Record<string, unknown> };
  } | null>('/auth/me');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.roles?.[0] || null);
        setUserEmail(payload.email || '');
        setUserName(payload.nombreCompleto || payload.email || '');
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (meData?.tenant?.nombre) {
      setTenantName(meData.tenant.nombre);
      const { config } = meData.tenant;
      const primaryColor = (config?.primaryColor as string) || '#065f46';
      applyTenantColors(primaryColor);
      try { localStorage.setItem('tenantConfig', JSON.stringify({ primaryColor, tenantName: meData.tenant.nombre })); } catch { /* ignore */ }
    }
  }, [meData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const permissions = meData?.permissions ?? [];

  const visibleMenu = useMemo(() => {
    const hasPerm = (recurso?: string) => {
      if (!recurso) return true;
      return permissions.includes(`${recurso}:consultar`);
    };
    return menuDefs.filter((item) => hasPerm(item.recurso));
  }, [permissions]);

  const visibleAdminMenu = useMemo(() => {
    const hasPerm = (recurso?: string) => {
      if (!recurso) return false;
      return permissions.includes(`${recurso}:consultar`);
    };
    return adminMenuItems.filter((item) => hasPerm(item.recurso));
  }, [permissions]);

  const navItems = userRole === 'super_admin'
    ? [...visibleMenu, ...visibleAdminMenu]
    : visibleMenu;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col shadow-[4px_0_24px_-8px_rgba(0,0,0,0.3)] transition-transform duration-300 lg:static lg:z-auto lg:w-56',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
        style={{ background: 'linear-gradient(to bottom, var(--tenant-primary), var(--tenant-gradient-mid), var(--tenant-gradient-end))' }}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/20 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-lg"
            style={{ background: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.1))' }}
          >
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-lg font-bold text-white">VisionPAE</span>
          <span className="ml-auto rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white/80">PAE</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-1 text-white/60 lg:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <SidebarLink key={item.href || item.label} item={item} pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
          ))}
        </nav>
        <div className="border-t border-white/20 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-white/30 shadow-inner" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {userRole === 'super_admin' ? 'Super Admin' : userRole?.replace(/_/g, ' ') || 'Usuario'}
              </p>
              <p className="truncate text-[10px] text-white/60">{tenantName || 'Cargando...'}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 lg:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="hidden h-7 w-1 rounded-full sm:flex" style={{ background: 'linear-gradient(to bottom, var(--tenant-primary), var(--tenant-primary-hover))' }} />
            <h2 className="text-sm font-semibold text-slate-700">PAE · {tenantName ? tenantName.split(' ').slice(0, 2).join(' ') : 'Boyacá'}</h2>
          </div>
          <div className="relative flex items-center gap-2 sm:gap-4" ref={dropdownRef}>
            <NotificationBell />
              <span className="rounded-full px-3 py-1 text-xs font-medium ring-1"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--tenant-primary) 10%, transparent)',
                  color: 'var(--tenant-primary)',
                  borderColor: 'color-mix(in srgb, var(--tenant-primary) 30%, transparent)',
                }}
              >
                {userRole === 'super_admin' ? 'Super Admin' : userRole?.replace(/_/g, ' ') || 'Usuario'}
              </span>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-100"
            >
              <div className="h-8 w-8 rounded-full shadow-md ring-2 ring-white"
                style={{ background: 'linear-gradient(to bottom right, var(--tenant-primary-light), var(--tenant-primary))' }}
              />
              <svg className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{userName || 'Usuario'}</p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/configuracion"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-100/40">
          <div className="mx-auto max-w-7xl p-3 sm:p-6">
            {children}
          </div>
        </main>
      </div>
      <SWRegister />
      <OfflineIndicator />
    </div>
  );
}
