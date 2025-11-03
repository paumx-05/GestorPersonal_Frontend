import './globals.css';
import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { SearchProvider } from '@/context/SearchContext';
import { ReservationCartProvider } from '@/context/ReservationCartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { TokenRefreshProvider } from '@/components/auth/TokenRefreshProvider';
import WelcomeNotification from '@/components/notifications/WelcomeNotification';

// Importar el interceptor de renovación automática de tokens
import '@/lib/api/authInterceptor';

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
          <TokenRefreshProvider>
            <NotificationsProvider>
              <SearchProvider>
                <ReservationCartProvider>
                  <FavoritesProvider>
                    <WelcomeNotification />
                    {children}
                  </FavoritesProvider>
                </ReservationCartProvider>
              </SearchProvider>
            </NotificationsProvider>
          </TokenRefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}