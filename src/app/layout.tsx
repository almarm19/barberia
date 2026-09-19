import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegister } from '../components/common/ServiceWorkerRegister';
import { BarberStoreProvider } from '../lib/store';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'BARBAS CUTS | Barber Studio - POS & Gestión',
  description: 'Sistema de punto de venta, inventario y tickets para Barbas Cuts Barber Studio.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Barbas Cuts POS',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable} dark`}>
      <head>
        <link rel="icon" href="/images/logo_barbas_cuts.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Barbas Cuts POS" />
      </head>
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-500 selection:text-zinc-950">
        <ServiceWorkerRegister />
        <BarberStoreProvider>{children}</BarberStoreProvider>
      </body>
    </html>
  );
}
