import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VisionPAE — Gestión de Compras PAE',
  description: 'Sistema de Gestión de Compras PAE — Ley 2046',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
