
-- Remover dados iniciais inseridos
DELETE FROM pontos_descarte WHERE nome_do_ponto IN (
  'Ecoponto Vila Madalena',
  'Ecoponto Ibirapuera', 
  'Ecoponto Shopping Eldorado',
  'Ecoponto Liberdade',
  'Ecoponto Moema',
  'Papa-Pilhas Extra Morumbi',
  'Ecoponto Santana',
  'Cooperativa de Reciclagem Itaim',
  'Ecoponto Lapa',
  'Papa-Eletrônicos Carrefour Aricanduva'
);
