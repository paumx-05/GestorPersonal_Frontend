import './globals.css';
import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';

const jost = Jost({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jost'
});

export const metadata: Metadata = {
  title: 'Airbnb Luxury - Exclusive Properties & Private Islands',
  description: 'Discover luxury apartments, villas and private islands in premium locations. Book your dream getaway with Airbnb.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jost.variable} font-jost antialiased`}>
        <AuthProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}