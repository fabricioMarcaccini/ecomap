import { PontoDescarte } from '@/shared/types';
import { Env } from '@/types/env';
import mysql from 'mysql2/promise';

export class PontoService {
  private env: Env;
  private isD1: boolean;
  private mysqlConnection: any;

  constructor(env: Env) {
    this.env = env;
    // Check if we're using D1 (Cloudflare) or MySQL (Vercel)
    this.isD1 = !!(env.DB && typeof env.DB.prepare === 'function');
    
    // If not D1, initialize MySQL connection for Vercel
    if (!this.isD1 && env.DATABASE_URL) {
      this.mysqlConnection = mysql;
    }
  }

  // Returns all approved points
  async getPontosAprovados(): Promise<PontoDescarte[]> {
    try {
      if (this.isD1) {
        // D1 implementation
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
      } else {
        // MySQL implementation for Vercel
        const connection = await this.mysqlConnection.createConnection(this.env.DATABASE_URL);
        const [rows] = await connection.execute(
          "SELECT * FROM pontos_descarte WHERE aprovado = 1 ORDER BY created_at DESC"
        );
        await connection.end();
        
        if (!rows || (Array.isArray(rows) && rows.length === 0)) {
          return [];
        }
        
        return (rows as any[]).map((ponto: any) => ({
          ...ponto,
          latitude: Number(ponto.latitude),
          longitude: Number(ponto.longitude),
          created_at: ponto.created_at,
          updated_at: ponto.updated_at
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar pontos aprovados:', error);
      throw new Error('Erro ao buscar pontos aprovados');
    }
  }

  // Returns all unapproved points (admin only)
  async getPontosNaoAprovados(): Promise<PontoDescarte[]> {
    try {
      if (this.isD1) {
        // D1 implementation
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
      } else {
        // MySQL implementation for Vercel
        const connection = await this.mysqlConnection.createConnection(this.env.DATABASE_URL);
        const [rows] = await connection.execute(
          "SELECT * FROM pontos_descarte WHERE aprovado = 0 ORDER BY created_at DESC"
        );
        await connection.end();
        
        if (!rows || (Array.isArray(rows) && rows.length === 0)) {
          return [];
        }
        
        return (rows as any[]).map((ponto: any) => ({
          ...ponto,
          latitude: Number(ponto.latitude),
          longitude: Number(ponto.longitude),
          created_at: ponto.created_at,
          updated_at: ponto.updated_at
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar pontos não aprovados:', error);
      throw new Error('Erro ao buscar pontos não aprovados');
    }
  }

  // Find a specific point by ID, regardless of approval status
  async getPontoById(id: number): Promise<PontoDescarte | null> {
    try {
      if (this.isD1) {
        // D1 implementation
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
      } else {
        // MySQL implementation for Vercel
        const connection = await this.mysqlConnection.createConnection(this.env.DATABASE_URL);
        const [rows] = await connection.execute(
          "SELECT * FROM pontos_descarte WHERE id = ?", [id]
        );
        await connection.end();
        
        if (!rows || (Array.isArray(rows) && rows.length === 0)) {
          return null;
        }
        
        const ponto = (rows as any[])[0];
        return {
          ...ponto,
          latitude: Number(ponto.latitude),
          longitude: Number(ponto.longitude),
        } as PontoDescarte;
      }
    } catch (error) {
      console.error(`Erro ao buscar ponto com ID ${id}:`, error);
      throw new Error('Erro ao buscar ponto por ID');
    }
  }

  // Create a new disposal point
  async createPonto(data: any): Promise<PontoDescarte> {
    try {
      // Validate coordinates
      if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
        throw new Error('Coordenadas geográficas inválidas');
      }
      
      if (this.isD1) {
        // D1 implementation
        const result = await this.env.DB.prepare(
          "INSERT INTO pontos_descarte (nome_do_ponto, descricao, latitude, longitude, materiais_aceitos, aprovado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
        ).bind(
          data.nome_do_ponto,
          data.descricao,
          data.latitude,
          data.longitude,
          data.materiais_aceitos,
          0 // New points need approval
        ).run();
        
        if (!result.success) {
          throw new Error('Falha ao inserir ponto no banco de dados');
        }
        
        // Fetch the newly created point
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
      } else {
        // MySQL implementation for Vercel
        const connection = await this.mysqlConnection.createConnection(this.env.DATABASE_URL);
        const [result]: any = await connection.execute(
          "INSERT INTO pontos_descarte (nome_do_ponto, descricao, latitude, longitude, materiais_aceitos, aprovado, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
          [data.nome_do_ponto, data.descricao, data.latitude, data.longitude, data.materiais_aceitos, 0]
        );
        
        if (!result || result.affectedRows === 0) {
          await connection.end();
          throw new Error('Falha ao inserir ponto no banco de dados');
        }
        
        // Fetch the newly created point
        const [rows] = await connection.execute(
          "SELECT * FROM pontos_descarte WHERE id = ?", [result.insertId]
        );
        await connection.end();
        
        if (!rows || (Array.isArray(rows) && rows.length === 0)) {
          throw new Error('Falha ao recuperar ponto criado');
        }
        
        const ponto = (rows as any[])[0];
        
        return {
          ...ponto,
          latitude: Number(ponto.latitude),
          longitude: Number(ponto.longitude),
          created_at: ponto.created_at,
          updated_at: ponto.updated_at
        };
      }
    } catch (error) {
      console.error('Erro ao criar ponto:', error);
      throw new Error('Erro ao criar ponto de descarte');
    }
  }

  // Approve a disposal point (admin only)
  async aprovarPonto(id: number): Promise<PontoDescarte> {
    try {
      if (this.isD1) {
        // D1 implementation
        // First check if the point exists
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
        
        // Fetch the updated point
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
      } else {
        // MySQL implementation for Vercel
        const connection = await this.mysqlConnection.createConnection(this.env.DATABASE_URL);
        
        // First check if the point exists
        const [existingRows] = await connection.execute(
          "SELECT * FROM pontos_descarte WHERE id = ?", [id]
        );
        
        if (!existingRows || (Array.isArray(existingRows) && existingRows.length === 0)) {
          await connection.end();
          throw new Error('Ponto não encontrado');
        }
        
        const [updateResult]: any = await connection.execute(
          "UPDATE pontos_descarte SET aprovado = 1, updated_at = NOW() WHERE id = ?", [id]
        );
        
        if (!updateResult || updateResult.affectedRows === 0) {
          await connection.end();
          throw new Error('Falha ao aprovar ponto no banco de dados');
        }
        
        // Fetch the updated point
        const [rows] = await connection.execute(
          "SELECT * FROM pontos_descarte WHERE id = ?", [id]
        );
        await connection.end();
        
        if (!rows || (Array.isArray(rows) && rows.length === 0)) {
          throw new Error('Falha ao recuperar ponto aprovado');
        }
        
        const ponto = (rows as any[])[0];
        
        return {
          ...ponto,
          latitude: Number(ponto.latitude),
          longitude: Number(ponto.longitude),
          created_at: ponto.created_at,
          updated_at: ponto.updated_at
        };
      }
    } catch (error) {
      console.error('Erro ao aprovar ponto:', error);
      throw new Error('Erro ao aprovar ponto');
    }
  }

  // Remove a disposal point (admin only)
  async removerPonto(id: number): Promise<boolean> {
    try {
      if (this.isD1) {
        // D1 implementation
        const result = await this.env.DB.prepare(
          "DELETE FROM pontos_descarte WHERE id = ?"
        ).bind(id).run();
        
        return result.success && result.meta.changes > 0;
      } else {
        // MySQL implementation for Vercel
        const connection = await this.mysqlConnection.createConnection(this.env.DATABASE_URL);
        const [result]: any = await connection.execute(
          "DELETE FROM pontos_descarte WHERE id = ?", [id]
        );
        await connection.end();
        
        return result && result.affectedRows > 0;
      }
    } catch (error) {
      console.error('Erro ao remover ponto:', error);
      throw new Error('Erro ao remover ponto');
    }
  }
}