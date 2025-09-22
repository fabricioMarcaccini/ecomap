import { useState, useCallback } from 'react';
import { PontoDescarte, CreatePontoDescarte } from '@/shared/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function usePontos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPontos = useCallback(async (): Promise<PontoDescarte[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pontos');
      const result: ApiResponse<PontoDescarte[]> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao buscar pontos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPontosNaoAprovados = useCallback(async (): Promise<PontoDescarte[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/pontos/nao-aprovados', {
        headers: {
          'x-admin-token': adminToken || '',
        },
      });
      const result: ApiResponse<PontoDescarte[]> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao buscar pontos não aprovados');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const criarPonto = useCallback(async (ponto: CreatePontoDescarte): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Validação local básica antes de enviar
      if (!ponto.nome_do_ponto?.trim() || ponto.nome_do_ponto.trim().length < 3) {
        throw new Error('Nome do ponto deve ter pelo menos 3 caracteres');
      }
      
      if (!ponto.descricao?.trim() || ponto.descricao.trim().length < 10) {
        throw new Error('Descrição deve ter pelo menos 10 caracteres');
      }
      
      if (!ponto.materiais_aceitos?.trim()) {
        throw new Error('Materiais aceitos são obrigatórios');
      }
      
      if (Math.abs(ponto.latitude) > 90 || Math.abs(ponto.longitude) > 180) {
        throw new Error('Coordenadas geográficas inválidas');
      }
      
      // Sanitizar dados antes de enviar
      const sanitizedPonto = {
        nome_do_ponto: ponto.nome_do_ponto.trim().substring(0, 200),
        descricao: ponto.descricao.trim().substring(0, 1000),
        materiais_aceitos: ponto.materiais_aceitos.trim().substring(0, 500),
        latitude: Number(ponto.latitude.toFixed(6)),
        longitude: Number(ponto.longitude.toFixed(6))
      };
      
      const response = await fetch('/api/pontos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPonto),
      });
      
      if (!response.ok) {
        const result: ApiResponse<any> = await response.json();
        throw new Error(result.error || `Erro HTTP ${response.status}`);
      }
      
      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar ponto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aprovarPonto = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/pontos/${id}/aprovar`, {
        method: 'PUT',
        headers: {
          'x-admin-token': adminToken || '',
        },
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao aprovar ponto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removerPonto = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/pontos/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken || '',
        },
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao remover ponto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchPontos,
    fetchPontosNaoAprovados,
    criarPonto,
    aprovarPonto,
    removerPonto,
  };
}
