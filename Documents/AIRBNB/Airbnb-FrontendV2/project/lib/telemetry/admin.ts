/**
 * Servicio de telemetría para el panel de administración
 * Registra métricas de rendimiento y errores para observabilidad
 */

interface TelemetryEvent {
  event: string;
  timestamp: string;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  responseSize?: number;
}

class AdminTelemetry {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getCurrentUserId();
  }

  /**
   * Generar ID de sesión único
   */
  private generateSessionId(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener ID del usuario actual
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userData = localStorage.getItem('airbnb_user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      console.warn('No se pudo obtener el ID del usuario:', error);
    }
    return undefined;
  }

  /**
   * Registrar evento de telemetría
   */
  logEvent(event: string, data: Record<string, any> = {}): void {
    const telemetryEvent: TelemetryEvent = {
      event,
      timestamp: new Date().toISOString(),
      data,
      userId: this.userId,
      sessionId: this.sessionId
    };

    // Log en consola para desarrollo
    console.log('📊 [Telemetry]', telemetryEvent);

    // En producción, enviar a servicio de telemetría
    if (process.env.NODE_ENV === 'production') {
      this.sendToTelemetryService(telemetryEvent);
    }
  }

  /**
   * Registrar métricas de rendimiento de API
   */
  logApiPerformance(metrics: PerformanceMetrics): void {
    this.logEvent('api_performance', {
      endpoint: metrics.endpoint,
      method: metrics.method,
      duration: metrics.duration,
      status: metrics.status,
      responseSize: metrics.responseSize,
      performance: this.categorizePerformance(metrics.duration)
    });
  }

  /**
   * Registrar error de API
   */
  logApiError(endpoint: string, error: Error, status?: number): void {
    this.logEvent('api_error', {
      endpoint,
      error: error.message,
      status,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Registrar carga de componente
   */
  logComponentLoad(componentName: string, duration: number): void {
    this.logEvent('component_load', {
      component: componentName,
      duration,
      performance: this.categorizePerformance(duration)
    });
  }

  /**
   * Registrar interacción del usuario
   */
  logUserInteraction(action: string, target: string, data?: Record<string, any>): void {
    this.logEvent('user_interaction', {
      action,
      target,
      ...data
    });
  }

  /**
   * Categorizar rendimiento basado en duración
   */
  private categorizePerformance(duration: number): string {
    if (duration < 200) return 'excellent';
    if (duration < 500) return 'good';
    if (duration < 1000) return 'fair';
    if (duration < 2000) return 'poor';
    return 'critical';
  }

  /**
   * Enviar evento a servicio de telemetría (producción)
   */
  private async sendToTelemetryService(event: TelemetryEvent): Promise<void> {
    try {
      // En producción, enviar a servicio real de telemetría
      // Por ahora, solo log en consola
      console.log('📡 [Telemetry] Enviando a servicio:', event);
    } catch (error) {
      console.error('Error enviando telemetría:', error);
    }
  }

  /**
   * Obtener métricas de sesión
   */
  getSessionMetrics(): Record<string, any> {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}

// Instancia global de telemetría
export const adminTelemetry = new AdminTelemetry();

// Hook para usar telemetría en componentes React
export function useAdminTelemetry() {
  return {
    logEvent: adminTelemetry.logEvent.bind(adminTelemetry),
    logApiPerformance: adminTelemetry.logApiPerformance.bind(adminTelemetry),
    logApiError: adminTelemetry.logApiError.bind(adminTelemetry),
    logComponentLoad: adminTelemetry.logComponentLoad.bind(adminTelemetry),
    logUserInteraction: adminTelemetry.logUserInteraction.bind(adminTelemetry),
    getSessionMetrics: adminTelemetry.getSessionMetrics.bind(adminTelemetry)
  };
}

// Interceptor para métricas de API
export function createApiTelemetryInterceptor() {
  return {
    request: (config: any) => {
      config.metadata = { startTime: Date.now() };
      return config;
    },
    response: (response: any) => {
      const duration = Date.now() - response.config.metadata.startTime;
      adminTelemetry.logApiPerformance({
        endpoint: response.config.url,
        method: response.config.method?.toUpperCase() || 'GET',
        duration,
        status: response.status,
        responseSize: JSON.stringify(response.data).length
      });
      return response;
    },
    error: (error: any) => {
      const duration = Date.now() - error.config?.metadata?.startTime || 0;
      adminTelemetry.logApiError(
        error.config?.url || 'unknown',
        error,
        error.response?.status
      );
      return Promise.reject(error);
    }
  };
}
