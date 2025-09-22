# EcoMap - Sistema de Pontos de Descarte Ecológico

Plataforma colaborativa para localização e cadastro de pontos de descarte ecológico no Brasil.

## 🚀 Tecnologias

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Leaflet
- **Backend**: Hono, Node.js
- **Banco de Dados**: SQLite
- **Mapas**: OpenStreetMap com Leaflet

## 📋 Pré-requisitos

- Node.js 18+ 
- NPM ou Yarn
- SQLite3

## ⚙️ Configuração para Desenvolvimento Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Token de Acesso Administrativo (mínimo 32 caracteres)
ADMIN_ACCESS_TOKEN=your_secure_admin_token_here_32chars_min

# Configuração do banco de dados local
DATABASE_URL=file:./dev.db
```

### 3. Configurar Banco de Dados Local

```bash
# Criar banco de dados local
sqlite3 dev.db < scripts/setup-local-db.sql
```

### 4. Executar em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Build para Produção

```bash
# Verificar código e gerar build
npm run build
```

## 📱 Funcionalidades

### Para Usuários
- **Visualizar Mapa**: Navegar pelo mapa e encontrar pontos de descarte próximos
- **Adicionar Pontos**: Clicar no mapa para sugerir novos pontos de descarte
- **Detalhes dos Pontos**: Ver informações sobre materiais aceitos e localização

### Para Administradores
- **Login Seguro**: Autenticação via token administrativo
- **Aprovar Pontos**: Revisar e aprovar pontos sugeridos pelos usuários
- **Gerenciar Pontos**: Editar ou remover pontos existentes
- **Auditoria**: Logs detalhados de todas as operações administrativas

## 🔒 Segurança

- **CSP Headers**: Proteção contra XSS
- **Rate Limiting**: 100 requests/minuto por IP
- **Sanitização**: Validação e limpeza de todas as entradas
- **Autenticação Robusta**: Tokens seguros para administração
- **Logs de Auditoria**: Monitoramento de atividades administrativas

## 🗂️ Estrutura do Projeto

```
src/
├── react-app/           # Frontend React
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Custom hooks
│   └── main.tsx        # Entry point
├── worker/             # Backend API
│   ├── api/           # Rotas da API
│   ├── middleware/    # Middlewares de segurança
│   └── utils/         # Utilitários
└── shared/            # Tipos compartilhados
```

## 🔧 Configuração de Administrador

1. Gere um token seguro (recomendado 32+ caracteres)
2. Configure a variável `ADMIN_ACCESS_TOKEN` no arquivo `.env`
3. Use este token para acessar o painel administrativo em `/admin`

## 🌍 Dados de Exemplo

O banco de dados local já vem com alguns pontos de exemplo:
- Ecoponto Centro (São Paulo)
- Shopping EcoVerde (São Paulo)

## 📞 Suporte

Para questões técnicas, consulte a documentação ou entre em contato com o desenvolvedor.

## 📄 Licença

Projeto desenvolvido para fins educacionais.
