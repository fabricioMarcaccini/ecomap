# Configuração para Desenvolvimento Local

## 🛠️ Setup Rápido

### 1. Dependências

```bash
npm install
```

### 2. Banco de Dados Local

Instale SQLite3 se não tiver:

```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS (via Homebrew)
brew install sqlite3

# Windows
# Baixe o SQLite3 do site oficial
```

Crie e configure o banco:

```bash
# Criar e popular banco de dados
sqlite3 dev.db < scripts/setup-local-db.sql
```

### 3. Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
ADMIN_ACCESS_TOKEN=gere_um_token_seguro_de_32_caracteres
DATABASE_URL=file:./dev.db
```

### 4. Executar

```bash
npm run dev
```

## 🔧 Comandos Úteis

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Linter
npm run lint

# Build para verificação
npm run build

# Verificar banco de dados
sqlite3 dev.db "SELECT * FROM pontos_descarte;"
```

## 🗃️ Gerenciamento do Banco Local

### Visualizar dados:
```bash
sqlite3 dev.db
.headers on
.mode column
SELECT * FROM pontos_descarte;
.exit
```

### Limpar dados de teste:
```bash
sqlite3 dev.db "DELETE FROM pontos_descarte WHERE id > 2;"
```

### Resetar banco:
```bash
rm dev.db
sqlite3 dev.db < scripts/setup-local-db.sql
```

## 🔐 Configuração de Admin Local

1. Gere um token seguro (recomendado 32+ caracteres)
2. Adicione no `.env` como `ADMIN_ACCESS_TOKEN`
3. Use o mesmo token no frontend quando solicitado

## 🌍 Testando Recursos

- **Mapa**: Acesse http://localhost:5173
- **Adicionar pontos**: Clique em qualquer lugar do mapa
- **Admin**: Acesse http://localhost:5173/admin
- **API**: Teste endpoints em http://localhost:5173/api

## ❗ Limitações do Desenvolvimento Local

- Rate limiting local pode se comportar diferente
- Logs de auditoria ficam apenas no console
- Alguns recursos de produção podem funcionar diferente

## 🚀 Próximos Passos

Após testar localmente, você pode fazer o deploy em qualquer plataforma que suporte Node.js e SQLite.
