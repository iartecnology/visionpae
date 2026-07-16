'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notification-bell';
import { SWRegister } from '@/components/sw-register';
import { OfflineIndicator } from '@/components/offline-indicator';

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Explorar', href: '/dashboard/explorar', icon: '🗺️' },
  { label: 'Catálogo', href: '/dashboard/catalogo', icon: '🛒' },
  { label: 'RUPL', href: '/dashboard/rupl', icon: '👥' },
  { label: 'Compras', href: '/dashboard/compras', icon: '📝' },
  { label: 'Certificaciones', href: '/dashboard/certificaciones', icon: '📋' },
  { label: 'Minutas', href: '/dashboard/minutas', icon: '🍽️' },
  { label: 'Ruedas', href: '/dashboard/ruedas', icon: '🤝' },
  { label: 'Incidencias', href: '/dashboard/incidencias', icon: '⚠️' },
  { label: 'Actas Recibo', href: '/dashboard/actas-recibo', icon: '📄' },
  { label: 'Notificaciones', href: '/dashboard/notificaciones', icon: '🔔' },
  { label: 'Reportes', href: '/dashboard/reportes', icon: '📈' },
  { label: 'Configuración', href: '/dashboard/configuracion', icon: '⚙️' },
];

const adminNav = [
  { label: 'Entidades', href: '/dashboard/admin/tenants', icon: '🏛️' },
  { label: 'Usuarios', href: '/dashboard/admin/usuarios', icon: '👤' },
  { label: 'Feature Flags', href: '/dashboard/admin/feature-flags', icon: '🚩' },
  { label: 'Sincronización', href: '/dashboard/admin/sincronizacion', icon: '🔄' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const navItems = userRole === 'super_admin' ? [...mainNav, ...adminNav] : mainNav;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.3)] transition-transform duration-300 lg:static lg:z-auto lg:w-56',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-emerald-700/50 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-lg font-bold text-white">VisionPAE</span>
          <span className="ml-auto rounded bg-emerald-700/50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200">PAE</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-1 text-emerald-300 lg:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                pathname.startsWith(item.href)
                  ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-emerald-200/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-emerald-700/30 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-900/50 px-3 py-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-inner" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-emerald-100">
                {userRole === 'super_admin' ? 'Super Admin' : userRole?.replace(/_/g, ' ') || 'Usuario'}
              </p>
              <p className="truncate text-[10px] text-emerald-300/70">Municipio de Tunja</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 lg:hidden">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="hidden h-7 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 sm:flex" />
            <h2 className="text-sm font-semibold text-slate-700">🏛️ PAE · Boyacá</h2>
          </div>
          <div className="relative flex items-center gap-2 sm:gap-4" ref={dropdownRef}>
            <NotificationBell />
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/50">
              {userRole === 'super_admin' ? 'Super Admin' : userRole?.replace(/_/g, ' ') || 'Usuario'}
            </span>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-100"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md ring-2 ring-white" />
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

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
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
