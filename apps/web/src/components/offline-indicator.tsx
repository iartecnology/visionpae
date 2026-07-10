'use client';

import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white shadow-lg">
      <span className="h-2 w-2 rounded-full bg-amber-200 animate-pulse" />
      Sin conexión — los cambios se sincronizarán cuando vuelva la red
    </div>
  );
}
