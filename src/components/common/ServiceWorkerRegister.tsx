'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker de Barbas Cuts registrado con éxito:', reg.scope);
        })
        .catch((err) => {
          console.error('Error registrando Service Worker:', err);
        });
    }
  }, []);

  return null;
}
