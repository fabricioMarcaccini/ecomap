import { useState } from 'react';
import { Shield, Loader2, Key } from 'lucide-react';

interface AdminLoginProps {
  onAdminVerified: () => void;
}

export default function AdminLogin({ onAdminVerified }: AdminLoginProps) {
  const [adminToken, setAdminToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica do token
    const trimmedToken = adminToken.trim();
    if (!trimmedToken) {
      setError('Token de acesso é obrigatório');
      return;
    }

    if (trimmedToken.length < 8) {
      setError('Token deve ter pelo menos 8 caracteres');
      return;
    }

    // Verificar se o token contém apenas caracteres válidos
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedToken)) {
      setError('Token contém caracteres inválidos');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminToken: trimmedToken }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `Erro HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Salvar apenas indicador de acesso verificado
        localStorage.setItem('adminAccess', 'verified');
        localStorage.setItem('adminToken', trimmedToken);
        onAdminVerified();
        
        // Limpar o token do estado para segurança
        setAdminToken('');
      } else {
        setError(result.error || 'Token de acesso inválido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão';
      console.error('Erro ao verificar token:', errorMessage);
      setError(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Acesso Administrativo
          </h1>
          <p className="text-gray-600">
            Insira o token de acesso para gerenciar pontos de descarte
          </p>
        </div>

        <form onSubmit={handleVerifyAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token de Acesso Administrativo
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Insira o token de acesso"
                maxLength={64}
                minLength={8}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || !adminToken.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Shield size={16} />
            )}
            {verifying ? 'Verificando...' : 'Acessar Painel'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          O token de acesso é fornecido pelo administrador do sistema
        </p>
      </div>
    </div>
  );
}
