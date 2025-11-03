'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Database, Server } from 'lucide-react';

interface BackendStatus {
  isOnline: boolean;
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export default function AuthDebugger() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isOnline: false,
    responseTime: 0,
    lastChecked: new Date()
  });
  const [testCredentials, setTestCredentials] = useState({
    email: 'admin@airbnb.com',
    password: 'Admin1234!'
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Verificar estado del backend
  const checkBackendStatus = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:5000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        setBackendStatus({
          isOnline: true,
          responseTime,
          lastChecked: new Date()
        });
      } else {
        setBackendStatus({
          isOnline: false,
          responseTime,
          lastChecked: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setBackendStatus({
        isOnline: false,
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Probar login directo al backend
  const testBackendLogin = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCredentials)
      });
      
      const data = await response.json();
      
      setTestResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date()
      });
    } catch (error) {
      setTestResult({
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date()
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Verificar estado del frontend
  const checkFrontendAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      token: token ? `${token.substring(0, 20)}...` : null,
      user: user ? JSON.parse(user) : null
    };
  };

  useEffect(() => {
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const frontendAuth = checkFrontendAuth();

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">🔧 Auth Debugger</h1>
        <p className="text-slate-400">Herramientas de diagnóstico para el sistema de autenticación</p>
      </div>

      {/* Backend Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            Estado del Backend
          </CardTitle>
          <CardDescription className="text-slate-400">
            Verificación de conectividad con el servidor backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {backendStatus.isOnline ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-white">
                {backendStatus.isOnline ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <Badge variant={backendStatus.isOnline ? 'default' : 'destructive'}>
              {backendStatus.responseTime}ms
            </Badge>
          </div>
          
          {backendStatus.error && (
            <div className="text-red-400 text-sm">
              Error: {backendStatus.error}
            </div>
          )}
          
          <div className="text-slate-400 text-sm">
            Última verificación: {backendStatus.lastChecked.toLocaleTimeString()}
          </div>
          
          <Button 
            onClick={checkBackendStatus}
            variant="outline"
            size="sm"
            className="text-slate-300 border-slate-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar Ahora
          </Button>
        </CardContent>
      </Card>

      {/* Frontend Auth Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Estado del Frontend
          </CardTitle>
          <CardDescription className="text-slate-400">
            Estado actual de la autenticación en el cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Token</Label>
              <div className="text-white">
                {frontendAuth.hasToken ? (
                  <Badge variant="default" className="bg-green-600">
                    Presente
                  </Badge>
                ) : (
                  <Badge variant="destructive">Ausente</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Usuario</Label>
              <div className="text-white">
                {frontendAuth.hasUser ? (
                  <Badge variant="default" className="bg-green-600">
                    Cargado
                  </Badge>
                ) : (
                  <Badge variant="destructive">No cargado</Badge>
                )}
              </div>
            </div>
          </div>
          
          {frontendAuth.token && (
            <div>
              <Label className="text-slate-300">Token Preview</Label>
              <div className="text-slate-400 font-mono text-sm">
                {frontendAuth.token}
              </div>
            </div>
          )}
          
          {frontendAuth.user && (
            <div>
              <Label className="text-slate-300">Usuario</Label>
              <div className="text-slate-400">
                {frontendAuth.user.name} ({frontendAuth.user.email})
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backend Login Test */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Prueba de Login Backend</CardTitle>
          <CardDescription className="text-slate-400">
            Prueba directa del endpoint de login del backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-email" className="text-slate-300">Email</Label>
              <Input
                id="test-email"
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="test-password" className="text-slate-300">Contraseña</Label>
              <Input
                id="test-password"
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <Button 
            onClick={testBackendLogin}
            disabled={isTesting}
            className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Probando...
              </>
            ) : (
              'Probar Login'
            )}
          </Button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white font-semibold">
                  Resultado: {testResult.success ? 'Éxito' : 'Error'}
                </span>
                <Badge variant={testResult.success ? 'default' : 'destructive'}>
                  HTTP {testResult.status}
                </Badge>
              </div>
              
              <pre className="text-slate-300 text-sm overflow-auto">
                {JSON.stringify(testResult.data || testResult.error, null, 2)}
              </pre>
              
              <div className="text-slate-400 text-xs mt-2">
                Timestamp: {testResult.timestamp.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Acciones Rápidas</CardTitle>
          <CardDescription className="text-slate-400">
            Herramientas de diagnóstico y limpieza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            variant="outline"
            className="w-full text-slate-300 border-slate-600"
          >
            Limpiar localStorage y Recargar
          </Button>
          
          <Button 
            onClick={() => {
              console.clear();
              console.log('🧹 Console cleared');
            }}
            variant="outline"
            className="w-full text-slate-300 border-slate-600"
          >
            Limpiar Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}