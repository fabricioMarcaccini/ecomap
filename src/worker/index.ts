import { Hono } from "hono";
import { cors } from "hono/cors";
import pontos from "./api/pontos";
import auth from "./api/auth";
import { 
  securityHeadersMiddleware, 
  rateLimitMiddleware, 
  inputSanitizationMiddleware 
} from "./middleware/security";
import { Env } from "@/types/env";

const app = new Hono<{ Bindings: Env }>();

// Middleware de segurança aplicado globalmente
app.use("*", securityHeadersMiddleware);
app.use("*", rateLimitMiddleware);
app.use("*", inputSanitizationMiddleware);

// Configurar CORS
app.use("*", cors({
  origin: "*", // Para desenvolvimento e produção
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-admin-token",
    "CF-Connecting-IP",
    "X-Forwarded-For"
  ],
  credentials: true,
  maxAge: 86400,
}));

// Rotas da API
app.route("/api/pontos", pontos);
app.route("/api", auth);

// Rota raiz para verificação de status
app.get("/", (c) => {
  return c.json({
    service: "EcoMap API",
    description: "Sistema de Mapeamento de Pontos de Descarte Ecológico",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      pontos: "/api/pontos",
      admin: "/api/verify-admin",
    }
  });
});

// Health check endpoint para monitoramento
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: "production"
  });
});

export default app;
