import { PontoDescarte } from '@/shared/types';
import { Env } from '@/types/env';

export class PontoService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  // Retorna todos os pontos aprovados
  async getPontosAprovados(): Promise<PontoDescarte[]> {
    try {
      const { results } = await this.env.DB.prepare(
        "SELECT * FROM pontos_descarte WHERE aprovado = 1 ORDER BY created_at DESC"
      ).all();
      
      if (!results) {
        return [];
      }
      
      return results.map((ponto: any) => ({
        ...ponto,
        latitude: Number(ponto.latitude),
        longitude: Number(ponto.longitude),
        created_at: ponto.created_at,
        updated_at: ponto.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar pontos aprovados:', error);
      throw new Error('Erro ao buscar pontos aprovados');
    }
  }

  // Retorna todos os pontos não aprovados (apenas para admin)
  async getPontosNaoAprovados(): Promise<PontoDescarte[]> {
    try {
      const { results } = await this.env.DB.prepare(
        "SELECT * FROM pontos_descarte WHERE aprovado = 0 ORDER BY created_at DESC"
      ).all();
      
      if (!results) {
        return [];
      }
      
      return results.map((ponto: any) => ({
        ...ponto,
        latitude: Number(ponto.latitude),
        longitude: Number(ponto.longitude),
        created_at: ponto.created_at,
        updated_at: ponto.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar pontos não aprovados:', error);
      throw new Error('Erro ao buscar pontos não aprovados');
    }
  }

  // Busca um ponto específico pelo ID, independentemente do status de aprovação
  async getPontoById(id: number): Promise<PontoDescarte | null> {
    try {
      const ponto = await this.env.DB.prepare(
        "SELECT * FROM pontos_descarte WHERE id = ?"
      ).bind(id).first();

      if (!ponto) {
        return null;
      }

      return {
        ...ponto,
        latitude: Number(ponto.latitude),
        longitude: Number(ponto.longitude),
      } as PontoDescarte;
    } catch (error) {
      console.error(`Erro ao buscar ponto com ID ${id}:`, error);
      throw new Error('Erro ao buscar ponto por ID');
    }
  }

  // Cria um novo ponto de descarte
  async createPonto(data: any): Promise<PontoDescarte> {
    try {
      // Validação de coordenadas
      if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
        throw new Error('Coordenadas geográficas inválidas');
      }
      
      const result = await this.env.DB.prepare(
        "INSERT INTO pontos_descarte (nome_do_ponto, descricao, latitude, longitude, materiais_aceitos, aprovado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
      ).bind(
        data.nome_do_ponto,
        data.descricao,
        data.latitude,
        data.longitude,
        data.materiais_aceitos,
        0 // Novos pontos precisam ser aprovados
      ).run();
      
      if (!result.success) {
        throw new Error('Falha ao inserir ponto no banco de dados');
      }
      
      // Buscar o ponto recém-criado
      const { results } = await this.env.DB.prepare(
        "SELECT * FROM pontos_descarte WHERE id = ?"
      ).bind(result.meta.last_row_id).all();
      
      if (!results || results.length === 0) {
        throw new Error('Falha ao recuperar ponto criado');
      }
      
      const ponto = results[0];
      
      return {
        ...ponto,
        latitude: Number(ponto.latitude),
        longitude: Number(ponto.longitude),
        created_at: ponto.created_at,
        updated_at: ponto.updated_at
      };
    } catch (error) {
      console.error('Erro ao criar ponto:', error);
      throw new Error('Erro ao criar ponto de descarte');
    }
  }

  // Aprova um ponto de descarte (apenas para admin)
  async aprovarPonto(id: number): Promise<PontoDescarte> {
    try {
      // Primeiro verificar se o ponto existe
      const { results: existingResults } = await this.env.DB.prepare(
        "SELECT * FROM pontos_descarte WHERE id = ?"
      ).bind(id).all();
      
      if (!existingResults || existingResults.length === 0) {
        throw new Error('Ponto não encontrado');
      }
      
      const updateResult = await this.env.DB.prepare(
        "UPDATE pontos_descarte SET aprovado = 1, updated_at = datetime('now') WHERE id = ?"
      ).bind(id).run();
      
      if (!updateResult.success) {
        throw new Error('Falha ao aprovar ponto no banco de dados');
      }
      
      // Buscar o ponto atualizado
      const { results } = await this.env.DB.prepare(
        "SELECT * FROM pontos_descarte WHERE id = ?"
      ).bind(id).all();
      
      if (!results || results.length === 0) {
        throw new Error('Falha ao recuperar ponto aprovado');
      }
      
      const ponto = results[0];
      
      return {
        ...ponto,
        latitude: Number(ponto.latitude),
        longitude: Number(ponto.longitude),
        created_at: ponto.created_at,
        updated_at: ponto.updated_at
      };
    } catch (error) {
      console.error('Erro ao aprovar ponto:', error);
      throw new Error('Erro ao aprovar ponto');
    }
  }

  // Remove um ponto de descarte (apenas para admin)
  async removerPonto(id: number): Promise<boolean> {
    try {
      const result = await this.env.DB.prepare(
        "DELETE FROM pontos_descarte WHERE id = ?"
      ).bind(id).run();
      
      return result.success && result.meta.changes > 0;
    } catch (error) {
      console.error('Erro ao remover ponto:', error);
      throw new Error('Erro ao remover ponto');
    }
  }
}