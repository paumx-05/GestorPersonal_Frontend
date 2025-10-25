/**
 * Provider para la renovación automática de tokens
 * Se usa dentro del AuthProvider para evitar dependencias circulares
 */

'use client';

import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface TokenRefreshProviderProps {
  children: React.ReactNode;
}

export const TokenRefreshProvider: React.FC<TokenRefreshProviderProps> = ({ children }) => {
  // Configurar renovación automática de tokens
  useTokenRefresh();
  
  return <>{children}</>;
};

export default TokenRefreshProvider;
