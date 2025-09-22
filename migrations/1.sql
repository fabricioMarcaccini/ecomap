
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

CREATE INDEX idx_pontos_descarte_aprovado ON pontos_descarte(aprovado);
CREATE INDEX idx_pontos_descarte_location ON pontos_descarte(latitude, longitude);
