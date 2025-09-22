import { createMiddleware } from "hono/factory";

// Rate limiting simples em memória (para desenvolvimento)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const securityHeadersMiddleware = createMiddleware(async (c, next) => {
  await next();
  
  // Headers de segurança
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP básico
  c.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-src 'none';"
  );
});

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 100;
  
  const current = rateLimitStore.get(ip);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    current.count++;
    if (current.count > maxRequests) {
      return c.json({ error: 'Muitas requisições. Tente novamente em um minuto.' }, 429);
    }
  }
  
  // Limpar entradas expiradas periodicamente
  if (Math.random() < 0.01) { // 1% de chance
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  await next();
});

export const inputSanitizationMiddleware = createMiddleware(async (c, next) => {
  // Middleware básico para log de requisições suspeitas
  const userAgent = c.req.header('User-Agent') || '';
  const path = c.req.path;
  
  // Log de tentativas suspeitas
  if (userAgent.includes('sqlmap') || userAgent.includes('nikto') || path.includes('../')) {
    console.warn(`Requisição suspeita detectada: ${path}, User-Agent: ${userAgent}`);
  }
  
  await next();
});

// Função para sanitizar strings
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove caracteres HTML perigosos
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove caracteres de controle
    .substring(0, 1000); // Limita tamanho
};

// Função para validar coordenadas
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

// Comparação segura de strings para evitar timing attacks
export const safeStringCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};
