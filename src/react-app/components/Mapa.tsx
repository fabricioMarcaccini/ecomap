import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngTuple, Map as LeafletMap } from 'leaflet';
import { MapPin, Plus, X, Save, Loader2, Trash2, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { PontoDescarte, CreatePontoDescarte } from '@/shared/types';
import { usePontos } from '@/react-app/hooks/usePontos';
import 'leaflet/dist/leaflet.css';

// Configurar ícone personalizado do Leaflet
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface FormData {
  nome_do_ponto: string;
  descricao: string;
  materiais_aceitos: string;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Mapa() {
  const [pontos, setPontos] = useState<PontoDescarte[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome_do_ponto: '',
    descricao: '',
    materiais_aceitos: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });
  const [deletingPointId, setDeletingPointId] = useState<number | null>(null);
  const mapRef = useRef<LeafletMap>(null);
  
  const { fetchPontos, criarPonto, removerPonto, loading } = usePontos();

  // Verificar se o usuário tem acesso administrativo
  const isAdmin = localStorage.getItem('adminAccess') === 'verified';

  // Posição inicial do mapa (Brasil - São Paulo)
  const center: LatLngTuple = [-23.5505, -46.6333];

  useEffect(() => {
    loadPontos();
  }, []);

  const loadPontos = async () => {
    try {
      const pontosData = await fetchPontos();
      setPontos(pontosData);
    } catch (err) {
      console.error('Erro ao carregar pontos:', err);
      showNotification('error', 'Erro ao carregar pontos do mapa');
    }
  };

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setClickPosition({ lat, lng });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClickPosition(null);
    setFormData({
      nome_do_ponto: '',
      descricao: '',
      materiais_aceitos: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sanitização básica de entrada
    let sanitizedValue = value;
    
    // Remover caracteres potencialmente perigosos
    sanitizedValue = sanitizedValue.replace(/[<>\"'&]/g, '');
    
    // Limitar tamanho baseado no campo
    switch (name) {
      case 'nome_do_ponto':
        sanitizedValue = sanitizedValue.substring(0, 200);
        break;
      case 'descricao':
        sanitizedValue = sanitizedValue.substring(0, 1000);
        break;
      case 'materiais_aceitos':
        sanitizedValue = sanitizedValue.substring(0, 500);
        break;
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clickPosition) return;
    
    // Validação adicional no frontend
    if (!formData.nome_do_ponto.trim() || formData.nome_do_ponto.trim().length < 3) {
      showNotification('error', 'Nome do ponto deve ter pelo menos 3 caracteres');
      return;
    }
    
    if (!formData.descricao.trim() || formData.descricao.trim().length < 10) {
      showNotification('error', 'Descrição deve ter pelo menos 10 caracteres');
      return;
    }
    
    if (!formData.materiais_aceitos.trim()) {
      showNotification('error', 'Materiais aceitos são obrigatórios');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const novoPonto: CreatePontoDescarte = {
        nome_do_ponto: formData.nome_do_ponto.trim(),
        descricao: formData.descricao.trim(),
        materiais_aceitos: formData.materiais_aceitos.trim(),
        latitude: clickPosition.lat,
        longitude: clickPosition.lng,
      };
      
      await criarPonto(novoPonto);
      handleCloseModal();
      showNotification('success', 'Ponto de descarte enviado para aprovação!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar ponto de descarte';
      console.error('Erro ao criar ponto:', errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePoint = async (pontoId: number, nomePonto: string) => {
    if (!isAdmin) {
      showNotification('error', 'Acesso negado: apenas administradores podem excluir pontos');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir permanentemente o ponto "${nomePonto}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setDeletingPointId(pontoId);
    
    try {
      await removerPonto(pontoId);
      setPontos(prev => prev.filter(ponto => ponto.id !== pontoId));
      showNotification('success', `Ponto "${nomePonto}" excluído com sucesso`);
    } catch (err) {
      console.error('Erro ao excluir ponto:', err);
      showNotification('error', 'Erro ao excluir ponto. Tente novamente.');
    } finally {
      setDeletingPointId(null);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Mapa */}
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Marcadores dos pontos aprovados */}
        {pontos.map((ponto) => (
          <Marker
            key={ponto.id}
            position={[ponto.latitude, ponto.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-3 min-w-[280px]">
                {/* Header com título e controles admin */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-green-800 flex-1 pr-2">
                    {ponto.nome_do_ponto}
                  </h3>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                        <Shield size={12} />
                        Admin
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-3">{ponto.descricao}</p>
                
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <strong className="text-green-700">Materiais aceitos:</strong>
                  <p className="text-green-600 mt-1">{ponto.materiais_aceitos}</p>
                </div>

                {/* Informações técnicas para admin */}
                {isAdmin && (
                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mb-3">
                    <div><strong>ID:</strong> {ponto.id}</div>
                    <div><strong>Coordenadas:</strong> {ponto.latitude.toFixed(6)}, {ponto.longitude.toFixed(6)}</div>
                    {ponto.created_at && (
                      <div><strong>Criado em:</strong> {new Date(ponto.created_at).toLocaleString('pt-BR')}</div>
                    )}
                  </div>
                )}

                {/* Controles administrativos */}
                {isAdmin && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Controles Administrativos:</span>
                      <button
                        onClick={() => handleDeletePoint(ponto.id!, ponto.nome_do_ponto)}
                        disabled={deletingPointId === ponto.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingPointId === ponto.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {deletingPointId === ponto.id ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Instruções flutuantes */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="text-green-600" size={20} />
          <h3 className="font-semibold text-gray-800">Como usar</h3>
          {isAdmin && (
            <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
              <Shield size={12} />
              Admin
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Clique em qualquer local do mapa para adicionar um novo ponto de descarte.
          Os pontos serão analisados antes de aparecer no mapa.
        </p>
        {isAdmin && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-blue-600">
              <strong>Modo Admin:</strong> Você pode excluir pontos diretamente do mapa clicando nos marcadores.
            </p>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <Loader2 className="animate-spin text-green-600" size={24} />
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-[2000] max-w-sm ${
          notification.type === 'success' ? 'bg-green-100 border border-green-200' :
          notification.type === 'error' ? 'bg-red-100 border border-red-200' :
          'bg-yellow-100 border border-yellow-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="text-green-600" size={20} />}
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

      {/* Modal de formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Plus className="text-green-600" size={20} />
                  Novo Ponto de Descarte
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {clickPosition && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>Coordenadas:</strong> {clickPosition.lat.toFixed(6)}, {clickPosition.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nome_do_ponto" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Ponto *
                  </label>
                  <input
                    type="text"
                    id="nome_do_ponto"
                    name="nome_do_ponto"
                    value={formData.nome_do_ponto}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Ecoponto Centro"
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descreva o local e como chegar..."
                  />
                </div>

                <div>
                  <label htmlFor="materiais_aceitos" className="block text-sm font-medium text-gray-700 mb-1">
                    Materiais Aceitos *
                  </label>
                  <input
                    type="text"
                    id="materiais_aceitos"
                    name="materiais_aceitos"
                    value={formData.materiais_aceitos}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Papel, Plástico, Metal, Vidro"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {submitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
