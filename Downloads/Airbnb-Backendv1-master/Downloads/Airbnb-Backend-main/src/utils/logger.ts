/**
 * SISTEMA DE LOGGING AVANZADO
 * Logs estructurados con niveles, rotación y métricas
 */

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

interface LogMetrics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
  lastError?: string;
  lastWarning?: string;
}

// Almacén de logs en memoria (en producción usar archivos o servicio externo)
const logStore: LogEntry[] = [];
const MAX_LOGS = 1000; // Límite de logs en memoria

class Logger {
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addLog(level: LogEntry['level'], message: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      requestId: metadata?.requestId || this.generateRequestId()
    };

    // Agregar al almacén
    logStore.push(logEntry);

    // Mantener límite de logs
    if (logStore.length > MAX_LOGS) {
      logStore.shift();
    }

    // Output a consola con colores
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      DEBUG: '\x1b[35m'    // Magenta
    };
    
    const resetColor = '\x1b[0m';
    const coloredLevel = `${colors[level]}${level}${resetColor}`;
    
    console.log(`[${coloredLevel}] ${logEntry.timestamp} - ${message}`, metadata || '');
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.addLog('INFO', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.addLog('WARN', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.addLog('ERROR', message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      this.addLog('DEBUG', message, metadata);
    }
  }

  // Métricas y análisis
  getMetrics(): LogMetrics {
    const metrics: LogMetrics = {
      totalLogs: logStore.length,
      errorCount: logStore.filter(log => log.level === 'ERROR').length,
      warningCount: logStore.filter(log => log.level === 'WARN').length,
      infoCount: logStore.filter(log => log.level === 'INFO').length,
      debugCount: logStore.filter(log => log.level === 'DEBUG').length
    };

    const lastError = logStore.filter(log => log.level === 'ERROR').pop();
    const lastWarning = logStore.filter(log => log.level === 'WARN').pop();

    if (lastError) metrics.lastError = lastError.message;
    if (lastWarning) metrics.lastWarning = lastWarning.message;

    return metrics;
  }

  getLogs(level?: LogEntry['level'], limit = 100): LogEntry[] {
    let filteredLogs = logStore;
    
    if (level) {
      filteredLogs = logStore.filter(log => log.level === level);
    }

    return filteredLogs.slice(-limit);
  }

  clearLogs(): void {
    logStore.length = 0;
  }

  // Logging específico para requests HTTP
  logRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string): void {
    this.info(`HTTP ${method} ${url}`, {
      statusCode,
      responseTime: `${responseTime}ms`,
      userId,
      type: 'http_request'
    });
  }

  // Logging específico para autenticación
  logAuth(action: string, email: string, success: boolean, ip?: string): void {
    this.info(`Auth ${action}`, {
      email,
      success,
      ip,
      type: 'authentication'
    });
  }
}

export default new Logger();
