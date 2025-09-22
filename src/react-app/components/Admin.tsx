import { useEffect, useState, useCallback } from 'react';
import { Shield, Check, Trash2, Loader2, RefreshCw, MapPin, LogOut, AlertTriangle, Eye } from 'lucide-react';
import { PontoDescarte } from '@/shared/types';
import { usePontos } from '@/react-app/hooks/usePontos';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export default function Admin() {
  const [pontosNaoAprovados, setPontosNaoAprovados] = useState<PontoDescarte[]>([]);
  const [processando, setProcessando] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const { fetchPontosNaoAprovados, aprovarPonto, removerPonto, loading, error } = usePontos();

  const showNotification = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  const handleLogout = async () => {
    if (confirm('Confirma saída do painel administrativo? Será necessário inserir o token novamente.')) {
      localStorage.removeItem('adminAccess');
      localStorage.removeItem('adminToken');
      window.location.href = '/';
    }
  };

  const loadPontosNaoAprovados = useCallback(async () => {
    try {
      const pontos = await fetchPontosNaoAprovados();
      setPontosNaoAprovados(pontos);
      if (pontos.length === 0) {
        showNotification('success', 'Parabéns! Todos os pontos estão aprovados.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showNotification('error', `Erro ao carregar pontos: ${errorMessage}`);
    }
  }, [fetchPontosNaoAprovados, showNotification]);

  useEffect(() => {
    loadPontosNaoAprovados();
  }, [loadPontosNaoAprovados]);

  const handleAprovar = async (id: number, nome: string) => {
    if (!confirm(`Aprovar o ponto "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setProcessando(id);
    try {
      await aprovarPonto(id);
      setPontosNaoAprovados(prev => prev.filter(ponto => ponto.id !== id));
      showNotification('success', `Ponto "${nome}" aprovado com sucesso!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showNotification('error', `Erro ao aprovar ponto: ${errorMessage}`);
    } finally {
      setProcessando(null);
    }
  };

  const handleRemover = async (id: number, nome: string) => {
    if (!confirm(`Excluir permanentemente o ponto "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    setProcessando(id);
    try {
      await removerPonto(id);
      setPontosNaoAprovados(prev => prev.filter(ponto => ponto.id !== id));
      showNotification('success', `Ponto "${nome}" excluído com sucesso.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      showNotification('error', `Erro ao excluir ponto: ${errorMessage}`);
    } finally {
      setProcessando(null);
    }
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openInMaps = (lat: number, lng: number, nome: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(nome)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600">Gestão de pontos de descarte ecológico</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadPontosNaoAprovados}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                Atualizar
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pontosNaoAprovados.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Admin</p>
                <p className="text-sm font-medium text-green-600">Autenticado</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sistema</p>
                <p className="text-sm font-medium text-green-600">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notification.show && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <Check className="text-green-600" size={20} />}
              {notification.type === 'error' && <AlertTriangle className="text-red-600" size={20} />}
              {notification.type === 'warning' && <AlertTriangle className="text-yellow-600" size={20} />}
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' :
                notification.type === 'error' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              <p className="text-red-800 font-medium">Erro do Sistema</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && pontosNaoAprovados.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sistema Atualizado
            </h3>
            <p className="text-gray-600">
              Todos os pontos de descarte foram revisados e aprovados.
            </p>
          </div>
        )}

        {/* Content Table */}
        {!loading && pontosNaoAprovados.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Pontos Aguardando Aprovação ({pontosNaoAprovados.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Ponto de Descarte
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Localização
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Data de Submissão
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pontosNaoAprovados.map((ponto) => (
                    <tr key={ponto.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900">
                            {ponto.nome_do_ponto}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Materiais:</span> {ponto.materiais_aceitos}
                          </div>
                          {expandedRows.has(ponto.id!) && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              <span className="font-medium">Descrição:</span> {ponto.descricao}
                            </div>
                          )}
                          <button
                            onClick={() => toggleRowExpansion(ponto.id!)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Eye size={12} />
                            {expandedRows.has(ponto.id!) ? 'Ocultar detalhes' : 'Ver detalhes'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="font-mono text-gray-600">
                            {ponto.latitude.toFixed(6)}, {ponto.longitude.toFixed(6)}
                          </div>
                          <button
                            onClick={() => openInMaps(ponto.latitude, ponto.longitude, ponto.nome_do_ponto)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Abrir no Google Maps
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {ponto.created_at ? formatDate(ponto.created_at) : 'Data não disponível'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAprovar(ponto.id!, ponto.nome_do_ponto)}
                            disabled={processando === ponto.id}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processando === ponto.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRemover(ponto.id!, ponto.nome_do_ponto)}
                            disabled={processando === ponto.id}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processando === ponto.id ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
