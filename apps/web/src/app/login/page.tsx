'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const testUsers = [
  { label: 'Super Admin', email: 'superadmin@pae.co', password: 'admin123', badge: 'super_admin' },
  { label: 'Admin Tunja', email: 'admin@pae.co', password: 'admin123', badge: 'admin_entidad' },
  { label: 'Operador Tunja', email: 'operador@pae.co', password: 'admin123', badge: 'operador' },
  { label: 'Admin Gobernación', email: 'admin@gobernacion.gov.co', password: 'admin123', badge: 'admin_entidad' },
  { label: 'Admin ICBF', email: 'admin@icbf.gov.co', password: 'admin123', badge: 'admin_entidad' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError('Credenciales inválidas');
        return;
      }

      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(user: typeof testUsers[0]) {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-4">
      <div className="flex w-full max-w-2xl gap-6">
        <Card className="flex-1 shadow-2xl shadow-emerald-950/50">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg">
                <span className="text-2xl font-bold text-white">V</span>
              </div>
            </div>
            <CardTitle className="text-2xl">VisionPAE</CardTitle>
            <CardDescription>Sistema de Gestión de Compras PAE — Ley 2046</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Correo electrónico</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@pae.co" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              ¿Eres productor?{' '}
              <a href="#" className="text-primary hover:underline">Regístrate aquí</a>
            </p>
          </CardFooter>
        </Card>

        <div className="w-64 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-100/70">Acceso rápido</p>
          {testUsers.map((u) => (
            <button
              key={u.email}
              onClick={() => quickLogin(u)}
              className="w-full rounded-lg border border-emerald-700/30 bg-white/10 p-3 text-left text-sm backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <p className="font-medium text-white">{u.label}</p>
              <p className="text-xs text-emerald-200">{u.email}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
