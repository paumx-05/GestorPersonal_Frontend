import ResetPasswordTester from '@/components/auth/ResetPasswordTester';

/**
 * Página de prueba para el reset password
 * Permite verificar que la solución funciona correctamente
 */
export default function TestResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <ResetPasswordTester />
      </div>
    </div>
  );
}
