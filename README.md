# G2 Arena Beach

Sistema para gerenciamento da G2 Arena Beach, com backend em Node.js/Express, banco PostgreSQL e frontend em React + Vite.

## Estrutura do projeto

- `server.js`: ponto de entrada do backend e servidor que expõe a API em `/api/v1`.
- `backend/`: controllers, models, middlewares, rotas e configuracao do banco.
- `frontend/`: aplicacao React responsavel pela interface do usuario.
- `scripts/`: atualmente sem arquivos.

## Requisitos

- Node.js 18 ou superior
- npm
- PostgreSQL em execucao
- Banco de dados criado e acessivel com as credenciais configuradas no arquivo `.env`

## Bibliotecas necessarias

### Backend

Dependencias de execucao instaladas na raiz do projeto:

- `express`
- `cors`
- `dotenv`
- `jsonwebtoken`
- `pg`
- `pg-promise`
- `bcrypt`
- `bcryptjs`

### Frontend

Dependencias principais em `frontend/package.json`:

- `react`
- `react-dom`
- `react-router-dom`

Dependencias de desenvolvimento do frontend:

- `vite`
- `@vitejs/plugin-react`
- `eslint`
- `eslint-plugin-react`
- `eslint-plugin-react-hooks`

## Configuracao de ambiente

Crie um arquivo `.env` na raiz do projeto com as variaveis usadas pelo backend:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=g2_arena
DB_USER=postgres
DB_PASSWORD=1234
DB_POOL_MAX=10
JWT_SECRET=quadras_dev_secret_2024
JWT_EXPIRES=8h
```

No frontend, crie um arquivo `frontend/.env` com a URL da API:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Instalacao

Na raiz do projeto:

```bash
npm install
```

Depois, instale as dependencias do frontend:

```bash
cd frontend
npm install
```

## Como executar em desenvolvimento

Abra dois terminais.

### Terminal 1 - backend

Na raiz do projeto:

```bash
npm run dev
```

Esse comando inicia o backend com `nodemon` na porta `3000`.

### Terminal 2 - frontend

Dentro da pasta `frontend`:

```bash
npm run dev
```

O Vite sobe a interface em `http://localhost:3001`.

### Acesso

- Frontend: `http://localhost:3001`
- Backend/API: `http://localhost:3000/api/v1`

## Como executar em producao local

O backend esta configurado para servir os arquivos gerados pelo build do frontend.

1. Gere o build da interface:

```bash
cd frontend
npm run build
```

2. Inicie o servidor principal na raiz do projeto:

```bash
npm start
```

Depois disso, a aplicacao fica disponivel em `http://localhost:3000` e a API em `http://localhost:3000/api/v1`.

## Endpoints principais da API

- `/api/v1/auth`
- `/api/v1/usuarios`
- `/api/v1/admins`
- `/api/v1/quadras`
- `/api/v1/agendamentos`
- `/api/v1/turmas`
- `/api/v1/produtos`
- `/api/v1/financeiro`
- `/api/v1/notificacoes`
- `/api/v1/auditoria`

O endpoint `/api/v1` retorna uma resposta simples com o status da API e a lista de rotas disponiveis.

## Scripts disponiveis

### Raiz do projeto

- `npm run dev`: inicia o backend com recarga automatica.
- `npm start`: inicia o backend em modo normal.
- `npm test`: atualmente nao configurado.

### Pasta `frontend`

- `npm run dev`: inicia o Vite em modo desenvolvimento.
- `npm run build`: gera a versao de producao.
- `npm run preview`: visualiza o build gerado.
- `npm run lint`: executa o ESLint.

## Suporte rapido de problemas

- Se o backend nao iniciar, verifique se o PostgreSQL esta ativo e se as credenciais do `.env` estao corretas.
- Se o frontend nao conseguir acessar a API, confirme o valor de `VITE_API_URL`.
- Se a porta `3000` ou `3001` ja estiver em uso, altere `PORT` ou a configuracao do Vite.
