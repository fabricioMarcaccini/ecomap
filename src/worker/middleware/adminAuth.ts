import { createMiddleware } from "hono/factory";
import { safeStringCompare } from "./security";
import { Env } from "@/types/env";

// Middleware para verificar token de admin
export const verifyAdminToken = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const adminToken = c.req.header('x-admin-token');
  
  if (!adminToken || adminToken.length < 8) {
    return c.json({ 
      error: "Token de administrador necessário e deve ter pelo menos 8 caracteres" 
    }, 401);
  }

  const validAdminToken = c.env.ADMIN_ACCESS_TOKEN;
  
  if (!validAdminToken) {
    return c.json({ error: "Token de admin não configurado no servidor" }, 500);
  }

  // Comparação segura para evitar timing attacks
  if (!safeStringCompare(adminToken, validAdminToken)) {
    // Log da tentativa de acesso não autorizado (sem expor o token)
    console.warn(`Tentativa de acesso admin não autorizada. IP: ${
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    }`);
    
    return c.json({ error: "Token de administrador inválido" }, 403);
  }

  await next();
});
