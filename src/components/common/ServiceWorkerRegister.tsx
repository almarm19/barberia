'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        console.log('Service Worker de Barbas Cuts registrado con éxito:', reg.scope);
        reg.update();
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_OLD_CACHES' });
        }
      })
      .catch((err) => {
        console.error('Error registrando Service Worker:', err);
      });
  }, []);

  return null;
}
