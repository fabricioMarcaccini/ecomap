import { z } from "zod";

// Schema para validação de pontos de descarte
export const PontoDescarteSchema = z.object({
  id: z.number().optional(),
  nome_do_ponto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(200),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres").max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  materiais_aceitos: z.string().min(1, "Materiais aceitos são obrigatórios").max(500),
  aprovado: z.boolean().optional().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema para criação de novos pontos (sem id)
export const CreatePontoDescarteSchema = PontoDescarteSchema.omit({
  id: true,
  aprovado: true,
  created_at: true,
  updated_at: true,
});

// Tipos derivados dos schemas
export type PontoDescarte = z.infer<typeof PontoDescarteSchema>;
export type CreatePontoDescarte = z.infer<typeof CreatePontoDescarteSchema>;

// Schema para resposta da API
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};
