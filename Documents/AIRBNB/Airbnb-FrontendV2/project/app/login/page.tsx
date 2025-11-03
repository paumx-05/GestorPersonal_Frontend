'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import DebugRegister from '@/components/auth/DebugRegister';
import SecretAuthDebugger from '@/components/auth/SecretAuthDebugger';
import BackendResponseTester from '@/components/auth/BackendResponseTester';
import SimpleAuthTest from '@/components/auth/SimpleAuthTest';
import BackendStatusChecker from '@/components/auth/BackendStatusChecker';
import TokenCleaner from '@/components/auth/TokenCleaner';
import BackendConnectivityTest from '@/components/auth/BackendConnectivityTest';
import PasswordSaveTest from '@/components/auth/PasswordSaveTest';
import BackendConnectionDebugger from '@/components/auth/BackendConnectionDebugger';
import BackendEndpointTester from '@/components/auth/BackendEndpointTester';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Login Page - Página dedicada de inicio de sesión
 * URL: /login
 * Features: Formulario de login, redirección automática, link al registro
 */
export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirigir si ya está autenticado (solo si no está cargando)
  useEffect(() => {
    // Evitar bucle: solo redirigir si definitivamente está autenticado
    if (isAuthenticated) {
      console.log('🔍 [LoginPage] Usuario autenticado, redirigiendo a home');
      router.replace('/'); // Usar replace en lugar de push para evitar historial
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = () => {
    router.push('/');
  };

  const handleSwitchToRegister = () => {
    router.push('/register');
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // No mostrar nada si ya está autenticado (evita flash) - solo si no está cargando
  if (isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <svg 
              width="102" 
              height="32" 
              fill="#FF385C" 
              viewBox="0 0 102 32"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1-.76 1.47l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.32A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95z"></path>
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-slate-400">
            Bienvenido de vuelta a Airbnb Luxury
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-xl">
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
          />
        </div>

        {/* Debug Register Component */}
        <div className="mt-6">
          <DebugRegister />
        </div>

        {/* Backend Response Tester */}
        <div className="mt-6">
          <BackendResponseTester />
        </div>

        {/* Token Cleaner - CRÍTICO */}
        <div className="mt-6">
          <TokenCleaner />
        </div>

        {/* Backend Endpoint Tester */}
        <div className="mt-6">
          <BackendEndpointTester />
        </div>

        {/* Backend Connection Debugger */}
        <div className="mt-6">
          <BackendConnectionDebugger />
        </div>

        {/* Password Save Test */}
        <div className="mt-6">
          <PasswordSaveTest />
        </div>

        {/* Backend Connectivity Test */}
        <div className="mt-6">
          <BackendConnectivityTest />
        </div>

        {/* Backend Status Checker */}
        <div className="mt-6">
          <BackendStatusChecker />
        </div>

        {/* Simple Auth Test */}
        <div className="mt-6">
          <SimpleAuthTest />
        </div>

        {/* SIMPLE TEST BUTTON - MUY VISIBLE */}
        <div className="mt-6 p-6 bg-red-600 rounded-lg border-2 border-red-500">
          <h3 className="text-white font-bold text-lg mb-4">🧪 TEST BACKEND</h3>
          <p className="text-white text-sm mb-4">
            Click este botón para ver exactamente qué devuelve el backend:
          </p>
          <button
            onClick={async () => {
              console.log('🧪 [TEST] Probando backend con credenciales del formulario...');
              try {
                // Probar con las credenciales que usa el formulario
                const response = await fetch('http://localhost:5000/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'admin@demo1.com', password: 'demo1234' })
                });
                const data = await response.json();
                console.log('📥 [TEST] Respuesta del backend:', data);
                alert(`BACKEND RESPONSE:\n\n${JSON.stringify(data, null, 2)}`);
              } catch (error) {
                console.log('💥 [TEST] Error:', error);
                alert(`ERROR:\n\n${error}`);
              }
            }}
            className="w-full bg-white text-red-600 font-bold py-3 px-4 rounded text-lg hover:bg-gray-100"
          >
            🧪 TEST BACKEND NOW
          </button>
        </div>


        {/* Demo Info */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-400 text-center">
            <strong className="text-slate-300">Demo:</strong> usa demo@airbnb.com con cualquier contraseña
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
      
      {/* Secret Auth Debugger - Solo visible con Ctrl+Shift+D */}
      <SecretAuthDebugger />
    </div>
  );
}


