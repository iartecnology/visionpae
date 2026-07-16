'use client';

import { useEffect, useState } from 'react';

export function SWRegister() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    (installPrompt as any).userChoice.then(() => setInstallPrompt(null));
  };

  if (!installPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-lg shadow-emerald-900/10">
      <p className="text-sm text-slate-700">Instala VisionPAE en tu dispositivo</p>
      <button
        onClick={handleInstall}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Instalar
      </button>
      <button onClick={() => setInstallPrompt(null)} className="text-sm text-slate-400 hover:text-slate-600">
        ✕
      </button>
    </div>
  );
}
