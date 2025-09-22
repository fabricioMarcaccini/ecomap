-- Criar tabela de pontos de descarte
CREATE TABLE pontos_descarte (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_do_ponto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  materiais_aceitos TEXT NOT NULL,
  aprovado BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO pontos_descarte (nome_do_ponto, descricao, latitude, longitude, materiais_aceitos, aprovado) 
VALUES 
('Ecoponto Centro', 'Ponto de coleta no centro da cidade, próximo à estação de metrô República. Funcionamento de segunda a sábado das 8h às 18h.', -23.5505, -46.6333, 'Papel, Plástico, Metal, Vidro', 1),
('Shopping EcoVerde', 'Ponto de coleta no estacionamento do shopping, próximo à entrada principal. Acesso 24 horas.', -23.5489, -46.6388, 'Eletrônicos, Pilhas, Baterias, Lâmpadas', 1);

-- Criar índices para melhor performance
CREATE INDEX idx_pontos_aprovado ON pontos_descarte(aprovado);
CREATE INDEX idx_pontos_created_at ON pontos_descarte(created_at);
