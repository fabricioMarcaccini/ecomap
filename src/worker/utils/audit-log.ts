/**
 * Sistema de auditoria para operações críticas
 */

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  userId?: string;
  userEmail?: string;
  ip?: string;
  details?: Record<string, any>;
  success: boolean;
  error?: string;
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLogEntry[] = [];
  private maxLogs = 1000; // Manter apenas os últimos 1000 logs em memória

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    // Adicionar ao array de logs
    this.logs.push(logEntry);

    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console para desenvolvimento
    if (entry.success) {
      console.info(`[AUDIT] ${entry.action}`, {
        user: entry.userEmail,
        ip: entry.ip,
        details: entry.details
      });
    } else {
      console.warn(`[AUDIT-FAIL] ${entry.action}`, {
        user: entry.userEmail,
        ip: entry.ip,
        error: entry.error,
        details: entry.details
      });
    }
  }

  getRecentLogs(limit = 50): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }

  getLogsByUser(userEmail: string, limit = 20): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userEmail === userEmail)
      .slice(-limit);
  }

  getFailedAttempts(action: string, timeRangeMinutes = 60): AuditLogEntry[] {
    const cutoffTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000);
    return this.logs.filter(log => 
      log.action === action && 
      !log.success && 
      new Date(log.timestamp) > cutoffTime
    );
  }
}

// Função helper para extrair IP do request
export function getClientIP(c: any): string {
  return c.req.header('CF-Connecting-IP') || 
         c.req.header('X-Forwarded-For') || 
         c.req.header('X-Real-IP') || 
         'unknown';
}

// Funções helper para diferentes tipos de log
export function logAdminAccess(userEmail: string, ip: string, success: boolean, error?: string) {
  AuditLogger.getInstance().log({
    action: 'ADMIN_ACCESS_ATTEMPT',
    userEmail,
    ip,
    success,
    error
  });
}

export function logPointCreation(userEmail: string | undefined, ip: string, pointId: number, success: boolean, error?: string) {
  AuditLogger.getInstance().log({
    action: 'POINT_CREATE',
    userEmail,
    ip,
    details: { pointId },
    success,
    error
  });
}

export function logPointApproval(userEmail: string, ip: string, pointId: number, success: boolean, error?: string) {
  AuditLogger.getInstance().log({
    action: 'POINT_APPROVE',
    userEmail,
    ip,
    details: { pointId },
    success,
    error
  });
}

export function logPointDeletion(userEmail: string, ip: string, pointId: number, pointName: string, success: boolean, error?: string) {
  AuditLogger.getInstance().log({
    action: 'POINT_DELETE',
    userEmail,
    ip,
    details: { pointId, pointName },
    success,
    error
  });
}
