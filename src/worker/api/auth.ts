import { Hono } from "hono";
import { safeStringCompare } from "../middleware/security";
import { Env } from "@/types/env";

const auth = new Hono<{ Bindings: Env }>();

// Verificar se usuário tem acesso de admin
auth.post("/verify-admin", async (c) => {
  try {
    const body = await c.req.json();
    const { adminToken } = body;
    
    if (!adminToken || typeof adminToken !== 'string' || adminToken.length < 8) {
      return c.json({ 
        error: "Token de acesso é obrigatório e deve ter pelo menos 8 caracteres" 
      }, 400);
    }

    const validAdminToken = c.env.ADMIN_ACCESS_TOKEN;
    
    if (!validAdminToken) {
      return c.json({ error: "Token de admin não configurado" }, 500);
    }

    // Comparação segura para evitar timing attacks
    if (!safeStringCompare(adminToken, validAdminToken)) {
      console.warn(`Tentativa de verificação admin falhada. IP: ${
        c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
      }`);
      
      return c.json({ error: "Token de acesso inválido" }, 403);
    }

    console.info(`Acesso admin concedido. IP: ${
      c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    }`);
    
    return c.json({ success: true, isAdmin: true });
  } catch (error) {
    console.error('Erro ao verificar admin:', error instanceof Error ? error.message : 'Erro desconhecido');
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

export default auth;
