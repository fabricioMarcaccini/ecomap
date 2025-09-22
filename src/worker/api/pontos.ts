import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CreatePontoDescarteSchema } from "@/shared/types"
import { verifyAdminToken } from "../middleware/adminAuth"
import { sanitizeString, validateCoordinates } from "../middleware/security"
import { Env } from "@/types/env"
import { PontoService } from "../db/PontoService"

const pontos = new Hono<{ Bindings: Env }>()
// Note: Vamos criar o serviço dentro das rotas para ter acesso ao env

// GET /api/pontos - Retorna pontos aprovados
pontos.get("/", async (c) => {
  try {
    const pontoService = new PontoService(c.env)
    const pontos = await pontoService.getPontosAprovados()
    
    return c.json({
      success: true,
      data: pontos,
    })
  } catch (error) {
    console.error("Erro ao buscar pontos:", error)
    return c.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      500
    )
  }
})

// GET /api/pontos/nao-aprovados - Retorna pontos não aprovados (admin)
pontos.get("/nao-aprovados", verifyAdminToken, async (c) => {
  try {
    const pontoService = new PontoService(c.env)
    const pontos = await pontoService.getPontosNaoAprovados()
    
    return c.json({
      success: true,
      data: pontos,
    })
  } catch (error) {
    console.error("Erro ao buscar pontos não aprovados:", error)
    return c.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      500
    )
  }
})

// POST /api/pontos - Cria novo ponto
pontos.post("/", zValidator("json", CreatePontoDescarteSchema), async (c) => {
  try {
    const data = c.req.valid("json")
    
    // Validação adicional de segurança
    if (!validateCoordinates(data.latitude, data.longitude)) {
      return c.json({
        success: false,
        error: "Coordenadas geográficas inválidas"
      }, 400)
    }
    
    // Sanitização de strings para prevenir injeções
    const sanitizedData = {
      nome_do_ponto: sanitizeString(data.nome_do_ponto),
      descricao: sanitizeString(data.descricao),
      materiais_aceitos: sanitizeString(data.materiais_aceitos),
      latitude: data.latitude,
      longitude: data.longitude
    }
    
    // Verificar se os dados sanitizados ainda são válidos
    if (!sanitizedData.nome_do_ponto || !sanitizedData.descricao || !sanitizedData.materiais_aceitos) {
      return c.json({
        success: false,
        error: "Dados inválidos após sanitização"
      }, 400)
    }
    
    const pontoService = new PontoService(c.env)
    const ponto = await pontoService.createPonto(sanitizedData)
    
    // Log da criação para auditoria (sem dados sensíveis)
    console.info(`Novo ponto criado: ID ${ponto.id}, coordenadas: ${data.latitude},${data.longitude}`)
    
    return c.json({
      success: true,
      message: "Ponto criado com sucesso! Aguardando aprovação.",
      data: { id: ponto.id },
    })
  } catch (error) {
    console.error("Erro ao criar ponto:", error instanceof Error ? error.message : 'Erro desconhecido')
    return c.json(
      {
        success: false,
        error: "Erro ao criar ponto de descarte",
      },
      500
    )
  }
})

// PUT /api/pontos/:id/aprovar - Aprova um ponto (admin)
pontos.put("/:id/aprovar", verifyAdminToken, async (c) => {
  try {
    const id = c.req.param("id")
    
    // Validação do ID
    const numericId = parseInt(id)
    if (isNaN(numericId) || numericId <= 0) {
      return c.json({
        success: false,
        error: "ID do ponto inválido"
      }, 400)
    }
    
    const pontoService = new PontoService(c.env)
    const ponto = await pontoService.aprovarPonto(numericId)
    
    if (ponto) {
      console.info(`Ponto ID ${numericId} aprovado pelo admin`)
      
      return c.json({
        success: true,
        message: "Ponto aprovado com sucesso",
      })
    } else {
      return c.json(
        {
          success: false,
          error: "Ponto não encontrado ou já aprovado",
        },
        404
      )
    }
  } catch (error) {
    console.error("Erro ao aprovar ponto:", error instanceof Error ? error.message : 'Erro desconhecido')
    return c.json(
      {
        success: false,
        error: "Erro ao aprovar ponto",
      },
      500
    )
  }
})

// DELETE /api/pontos/:id - Remove um ponto (admin)
pontos.delete("/:id", verifyAdminToken, async (c) => {
  try {
    const id = c.req.param("id")
    
    // Validação do ID
    const numericId = parseInt(id)
    if (isNaN(numericId) || numericId <= 0) {
      return c.json({
        success: false,
        error: "ID do ponto inválido"
      }, 400)
    }
    
    const pontoService = new PontoService(c.env)
    
    // Verificar se o ponto existe antes de tentar remover
    const pontoExistente = await pontoService.getPontoById(numericId)
    if (!pontoExistente) {
      return c.json({
        success: false,
        error: "Ponto não encontrado",
      }, 404)
    }
    
    const success = await pontoService.removerPonto(numericId)
    
    if (success) {
      // Log da remoção para auditoria
      console.info(`Ponto ID ${numericId} ("${pontoExistente.nome_do_ponto}") removido pelo admin`)
      
      return c.json({
        success: true,
        message: "Ponto removido com sucesso",
      })
    } else {
      return c.json(
        {
          success: false,
          error: "Erro inesperado ao remover ponto",
        },
        500
      )
    }
  } catch (error) {
    console.error("Erro ao remover ponto:", error instanceof Error ? error.message : 'Erro desconhecido')
    return c.json(
      {
        success: false,
        error: "Erro ao remover ponto",
      },
      500
    )
  }
})

export default pontos
