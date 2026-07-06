# 🏖️ G2 Arena Beach — Frontend (React + MVC)

Interface web do sistema de gerenciamento da **G2 Arena Beach**, um complexo de
quadras poliesportivas (beach tennis, futevôlei, vôlei de praia) localizado em
**Xanxerê/SC**. O frontend consome a **API REST** do backend em Node.js/Express
e cobre todos os requisitos funcionais (RF1 a RF18) do projeto.

> As notificações originalmente previstas por WhatsApp foram substituídas por
> **notificações internas (in-app)** — uma central de avisos + alertas em tela
> (toasts). Todo o restante segue o escopo do backend.

---

## ✨ Principais funcionalidades

| Módulo | Requisitos | Descrição |
|---|---|---|
| Autenticação | RF1, RF2 | Login por CPF ou e-mail, cadastro de cliente, recuperação de senha, controle de acesso por perfil (JWT). |
| Dashboard | RF2 | Painel inicial adaptado ao perfil (cliente, funcionário, administrador). |
| Agendamentos | RF3, RF4, RF5 | Consulta de disponibilidade, reserva de horários, fila de espera e cancelamento. |
| Turmas | RF6, RF7 | Inscrição em turmas/aulas e painel do professor. |
| Cardápio & Produtos | RF8, RF9 | Consulta do cardápio e gestão de produtos/estoque. |
| Financeiro | RF10, RF11, RF12 | Registro de caixa, atualização de pagamentos e relatório por período. |
| Quadras | RF13, RF14 | CRUD de quadras e gestão de horários. |
| Usuários | RF15 | Administração de clientes e da equipe interna. |
| Auditoria | RF16 | Métricas do sistema e histórico de operações (logs). |
| Notificações | RF17, RF18 | Central de avisos internos e alertas em tela. |

---

## 🧱 Arquitetura — padrão MVC

O projeto segue a separação de responsabilidades do padrão **MVC**, adaptado ao
ecossistema React:

```
src/
├── models/        → MODEL: entidades de domínio (Usuario, Quadra, Agendamento...)
├── services/      → Camada de acesso à API (fetch + tratamento de erros)
├── controllers/   → CONTROLLER: hooks com regras/estado (useQuadras, useFormulario...)
├── views/         → VIEW: interface do usuário
│   ├── components/ → componentes reutilizáveis (Botao, Modal, Tabela...)
│   ├── layouts/    → estrutura visual (menu lateral, topo)
│   └── pages/      → telas (uma por rota)
├── contexts/      → estado global (autenticação e notificações)
├── routes/        → definição e proteção de rotas
├── utils/         → funções auxiliares (formatação, validação, constantes)
└── styles/        → tema global (variáveis CSS da paleta praia)
```

- **Model** representa os dados e regras da entidade (ex.: `Usuario.ehAdministrador`).
- **View** apenas exibe e captura interações — não conhece a API diretamente.
- **Controller** (hooks) conecta a View aos Services e concentra o estado/regras.
- **Services** isolam o HTTP: se a API mudar, só essa camada é alterada.

> Uma explicação **arquivo por arquivo** está em [`EXPLICACAO_CODIGO.md`](./EXPLICACAO_CODIGO.md).

---

## 🛠️ Tecnologias utilizadas

- **React 18** (biblioteca de UI) + **Vite** (bundler/dev server rápido)
- **React Router DOM 6** (roteamento SPA)
- **Context API + Hooks** (estado global e lógica reutilizável)
- **CSS Modules** (estilos com escopo por componente)
- **Fetch API** (requisições HTTP — sem dependências externas)
- **ESLint** (padronização de código)

> Comparativo de tecnologias alternativas (TypeScript, Redux, Tailwind, Material UI,
> Axios) está em [`TECNOLOGIAS_ALTERNATIVAS.md`](./TECNOLOGIAS_ALTERNATIVAS.md).

---

## 🚀 Como executar

### Pré-requisitos
- **Node.js 18+** e **npm**
- O **backend** deve estar rodando (por padrão em `http://localhost:3000`).

### Passo a passo

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar a URL da API (opcional — já há um padrão)
cp .env.example .env
# edite VITE_API_URL se o backend não estiver em http://localhost:3000/api/v1

# 3. Rodar em modo desenvolvimento (porta 3001)
npm run dev

# 4. Gerar build de produção
npm run build

# 5. Pré-visualizar o build
npm run preview
```

Acesse **http://localhost:3001** no navegador.

> ⚠️ O frontend roda na porta **3001** para não conflitar com o backend (**3000**).

### Variáveis de ambiente (`.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL base da API do backend. |

---

## 👤 Usuários de teste (seeds do backend)

| Perfil | Login | Senha |
|---|---|---|
| Administrador | `roberto.admin@quadras.com` | `123456` |
| Cliente | `ana.lima@email.com` | `senha123` |

> O login aceita **CPF ou e-mail** no mesmo campo.

---

## 🔗 Integração com o backend

O detalhamento de como o frontend conversa com o backend e o banco de dados
(fluxo de autenticação JWT, formato das respostas, CORS, etc.) está em
[`INTEGRACAO_FRONTEND_BACKEND.md`](./INTEGRACAO_FRONTEND_BACKEND.md).

---

## 📄 Documentação do projeto

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Este arquivo — visão geral e instruções. |
| `EXPLICACAO_CODIGO.md` | Explicação detalhada de cada arquivo/camada. |
| `TECNOLOGIAS_ALTERNATIVAS.md` | Tecnologias alternativas e o que cada uma faria. |
| `INTEGRACAO_FRONTEND_BACKEND.md` | Como integrar frontend, backend e banco de dados. |
| `docs/ANALISE_BACKEND.md` | Contrato da API (endpoints, perfis, respostas). |

---

*Projeto acadêmico — G2 Arena Beach • Xanxerê/SC.*
