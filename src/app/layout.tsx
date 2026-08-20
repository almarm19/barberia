import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'BARBAS CUTS | Barber Studio - POS & Gestión',
  description: 'Sistema de punto de venta, inventario y tickets para Barbas Cuts Barber Studio.',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-500 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
