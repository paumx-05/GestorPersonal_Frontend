import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans'
});

export const metadata: Metadata = {
  title: 'PartFinder - Recambios de Coches',
  description: 'Encuentra los recambios que necesitas para tu vehículo. Búsqueda por marca, modelo y código TecDoc.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} font-sans bg-gray-900 text-gray-200`}>{children}</body>
    </html>
  );
}