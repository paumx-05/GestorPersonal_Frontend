# 🔄 Guía de Renovación Automática de Tokens - Frontend

## 📋 Resumen

Esta guía explica cómo implementar la renovación automática de tokens en el frontend para mantener sesiones activas sin interrupciones.

## 🎯 Objetivo

Mantener la sesión del usuario activa automáticamente renovando tokens JWT antes de que expiren, sin requerir que el usuario vuelva a iniciar sesión.

## 🔧 Implementación

### 1. Interceptor de Axios para Renovación Automática

```javascript
// utils/authInterceptor.js
import axios from 'axios';

// Interceptor de respuesta para manejar tokens expirados
axios.interceptors.response.use(
  (response) => {
    // Verificar si el servidor envió un nuevo token
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      console.log('🔄 Token renovado automáticamente');
      localStorage.setItem('token', newToken);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 403 (token expirado) y no hemos intentado renovar
    if (error.response?.status === 403 && 
        error.response?.data?.error?.message === 'Token inválido o expirado' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      
      try {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          // Intentar renovar el token
          const response = await axios.post('/api/auth/refresh', {
            token: currentToken
          });
          
          const newToken = response.data.data.token;
          localStorage.setItem('token', newToken);
          
          // Actualizar el header de la petición original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Reintentar la petición original
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error renovando token:', refreshError);
        // Si no se puede renovar, redirigir al login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Interceptor de petición para agregar token automáticamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2. Hook de React para Manejo de Autenticación

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Error de autenticación' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### 3. Componente de Protección de Rutas

```javascript
// components/ProtectedRoute.js
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### 4. Configuración de la Aplicación

```javascript
// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Importar el interceptor
import './utils/authInterceptor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## 🔍 Características Implementadas

### ✅ Renovación Automática
- Los tokens se renuevan automáticamente cuando están próximos a expirar
- No requiere intervención del usuario
- Mantiene la sesión activa sin interrupciones

### ✅ Manejo de Errores
- Si el token no se puede renovar, redirige automáticamente al login
- Manejo graceful de errores de red
- Logging para debugging

### ✅ Headers de Respuesta
- El servidor envía `X-New-Token` cuando renueva un token
- El frontend actualiza automáticamente el token almacenado
- Sincronización transparente entre frontend y backend

## 🧪 Testing

### Probar Renovación Automática

1. **Iniciar sesión** y obtener un token
2. **Esperar** hasta que el token esté próximo a expirar (15 minutos)
3. **Hacer una petición** a cualquier endpoint protegido
4. **Verificar** que el token se renueva automáticamente en localStorage

### Verificar Headers

```javascript
// En las herramientas de desarrollador, verificar:
console.log('Token actual:', localStorage.getItem('token'));

// Después de una petición que renueva el token:
// El header X-New-Token debe aparecer en la respuesta
```

## 🚨 Consideraciones Importantes

1. **Almacenamiento**: Los tokens se almacenan en `localStorage` (considera usar `httpOnly` cookies en producción)
2. **Seguridad**: Los tokens se renuevan automáticamente, pero el usuario original debe estar autenticado
3. **Red**: Si hay problemas de conectividad, el sistema fallback al login
4. **Múltiples pestañas**: Cada pestaña maneja su propia renovación de tokens

## 📚 Recursos Adicionales

- [Documentación de Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Context API](https://reactjs.org/docs/context.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
