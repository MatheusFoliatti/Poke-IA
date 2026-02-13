# 🔴 Pokédex AI - Intelligent Pokémon Assistant

<div align="center">

![Pokédex AI Banner](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png)

**Uma Pokédex inteligente alimentada por IA que fornece informações detalhadas sobre Pokémon, sugestões de times e muito mais!**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![Llama](https://img.shields.io/badge/LLM-Llama-FF6B6B.svg)](https://www.llama.com/)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Melhorias Futuras](#-melhorias-futuras)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

A **Pokédex AI** é uma aplicação web moderna que combina a clássica Pokédex com o poder da inteligência artificial. Utilizando o modelo Llama, a aplicação oferece uma experiência interativa onde usuários podem:

- 🔍 Consultar informações detalhadas sobre qualquer Pokémon
- 🤖 Conversar com um assistente IA especializado em Pokémon
- 👥 Receber sugestões personalizadas de times competitivos
- 📊 Analisar estatísticas e comparar Pokémon
- 💾 Manter histórico de conversas por usuário

### 🎨 Experiência Visual

A aplicação apresenta uma **animação única de abertura da Pokédex** após o login, proporcionando uma experiência nostálgica e moderna ao mesmo tempo!

---

## ✨ Funcionalidades

### 🔐 Autenticação

- Sistema de login/registro seguro
- Autenticação JWT
- Sessões persistentes por usuário

### 🤖 Chatbot Inteligente

- Respostas contextuais sobre Pokémon
- Sugestões de times baseadas em tipos e estratégias
- Análise de fraquezas e resistências
- Recomendações de movimentos e habilidades
- Histórico de conversas salvo por usuário

### 📊 Informações de Pokémon

- Dados completos da PokéAPI
- Estatísticas base e evoluções
- Sprites animados e artwork oficial
- Tipos, habilidades e movimentos
- Informações de habitat e raridade

### 💬 Interface Conversacional

- Chat em tempo real
- Sugestões de perguntas
- Formatação rica de respostas
- Visualização de sprites inline

---

## 🛠 Tecnologias Utilizadas

### Backend

- **Python 3.11+** - Linguagem principal
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **Llama (via Ollama)** - Modelo de linguagem
- **JWT** - Autenticação segura
- **HTTPX** - Cliente HTTP assíncrono para PokéAPI

### Frontend

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Framer Motion** - Animações
- **Axios** - Cliente HTTP
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado

### Infraestrutura

- **Docker & Docker Compose** - Containerização
- **Nginx** - Proxy reverso (produção)
- **Redis** - Cache (opcional)

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Ollama** - [Download](https://ollama.ai/) (para rodar Llama localmente)
- **Git** - [Download](https://git-scm.com/)

### Instalando Ollama e Llama

```bash
# Linux/Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelo Llama
ollama pull llama2
# ou para melhor performance
ollama pull llama3.2
```

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/pokedex-ai.git
cd pokedex-ai
```

### 2. Configure o Backend

```bash
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configure o Frontend

```bash
cd frontend

# Instale as dependências
npm install
```

---

## ⚙️ Configuração

### Backend (.env)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Database
DATABASE_URL=postgresql://pokedex_user:pokedex_pass@localhost:5432/pokedex_db

# JWT
SECRET_KEY=sua_chave_secreta_super_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# API
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (.env)

Crie um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Configurar Banco de Dados

```bash
# Entre no PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE pokedex_db;
CREATE USER pokedex_user WITH PASSWORD 'pokedex_pass';
GRANT ALL PRIVILEGES ON DATABASE pokedex_db TO pokedex_user;
\q

# Execute as migrações
cd backend
alembic upgrade head
```

---

## 🎮 Executando o Projeto

### Opção 1: Desenvolvimento Manual

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate no Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Terminal 3 - Ollama (se não estiver rodando):**

```bash
ollama serve
```

Acesse: **http://localhost:5173**

### Opção 2: Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## 📁 Estrutura do Projeto

```
pokedex-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Endpoints de autenticação
│   │   │   │   ├── chat.py          # Endpoints do chatbot
│   │   │   │   └── pokemon.py       # Endpoints de Pokémon
│   │   │   └── deps.py               # Dependências (auth, db)
│   │   │
│   │   ├── core/
│   │   │   ├── config.py             # Configurações
│   │   │   ├── security.py           # JWT e hashing
│   │   │   └── llm.py                # Integração Llama
│   │   │
│   │   ├── db/
│   │   │   ├── models.py             # Modelos SQLAlchemy
│   │   │   ├── database.py           # Conexão DB
│   │   │   └── session.py            # Sessões
│   │   │
│   │   ├── schemas/
│   │   │   ├── user.py               # Schemas de usuário
│   │   │   ├── chat.py               # Schemas de chat
│   │   │   └── pokemon.py            # Schemas de Pokémon
│   │   │
│   │   ├── services/
│   │   │   ├── pokeapi.py            # Cliente PokéAPI
│   │   │   ├── chat_service.py       # Lógica do chat
│   │   │   └── user_service.py       # Lógica de usuário
│   │   │
│   │   └── main.py                   # Aplicação principal
│   │
│   ├── alembic/                      # Migrações de BD
│   ├── tests/                        # Testes unitários
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   │
│   │   │   ├── Pokedex/
│   │   │   │   ├── PokedexAnimation.tsx  # Animação abertura
│   │   │   │   ├── ChatInterface.tsx     # Interface chat
│   │   │   │   ├── MessageBubble.tsx     # Bolhas de mensagem
│   │   │   │   └── PokemonCard.tsx       # Cards de Pokémon
│   │   │   │
│   │   │   └── Layout/
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useChat.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts                # Cliente Axios
│   │   │   └── auth.ts               # Serviço auth
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.ts          # Estado auth
│   │   │   └── chatStore.ts          # Estado chat
│   │   │
│   │   ├── types/
│   │   │   ├── pokemon.ts
│   │   │   └── chat.ts
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint             | Descrição                    |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/register` | Registrar novo usuário       |
| POST   | `/api/auth/login`    | Login e obter token JWT      |
| GET    | `/api/auth/me`       | Obter dados do usuário atual |

### Chat

| Método | Endpoint            | Descrição                    |
| ------ | ------------------- | ---------------------------- |
| POST   | `/api/chat/message` | Enviar mensagem ao chatbot   |
| GET    | `/api/chat/history` | Obter histórico de conversas |
| DELETE | `/api/chat/history` | Limpar histórico             |

### Pokémon

| Método | Endpoint                    | Descrição                 |
| ------ | --------------------------- | ------------------------- |
| GET    | `/api/pokemon/{id_or_name}` | Buscar Pokémon específico |
| GET    | `/api/pokemon/`             | Listar Pokémon (paginado) |
| GET    | `/api/pokemon/type/{type}`  | Buscar por tipo           |

---

## 📸 Screenshots

### Tela de Login

![Tela de Login do Projeto](assets/Login.png)

### Interface do Chat

![Interface do Chat](assets/Visual.png)

---

## 🚀 Melhorias Futuras

### 🎨 Interface

- [ ] Modo escuro/claro
- [ ] Temas baseados em tipos de Pokémon
- [ ] Animações de batalha
- [ ] Galeria de sprites (shiny, regional forms)
- [ ] Modo comparação lado-a-lado

### 🤖 IA e Chatbot

- [ ] Suporte a múltiplos modelos LLM
- [ ] Personalidade do chatbot baseada em Pokémon favorito
- [ ] Geração de histórias e lore
- [ ] Análise de matchups em batalhas
- [ ] Treinador virtual para testar times

### 📊 Funcionalidades

- [ ] Sistema de favoritos
- [ ] Construtor de times com análise de sinergia
- [ ] Calculadora de dano
- [ ] Simulador de batalhas
- [ ] Ranking de Pokémon por tier
- [ ] Notificações de novos Pokémon

### 🔧 Técnicas

- [ ] Cache Redis para respostas frequentes
- [ ] GraphQL API
- [ ] WebSocket para chat real-time
- [ ] Suporte PWA (offline-first)
- [ ] Testes end-to-end com Playwright
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Prometheus/Grafana
- [ ] Rate limiting e throttling

### 🌐 Social

- [ ] Sistema de amigos
- [ ] Compartilhamento de times
- [ ] Torneios e desafios
- [ ] Conquistas e badges
- [ ] Leaderboards

### 📱 Mobile

- [ ] App React Native
- [ ] Notificações push
- [ ] Modo offline

---

## 👨‍💻 Autor

Desenvolvido com ❤️ e ⚡ por Matheus Foliatti!

---

## 🙏 Agradecimentos

- [PokéAPI](https://pokeapi.co/) - API incrível de Pokémon
- [Ollama](https://ollama.ai/) - Framework para rodar LLMs localmente
- [FastAPI](https://fastapi.tiangolo.com/) - Framework web moderno
- [React](https://reactjs.org/) - Biblioteca UI incrível
- Comunidade Pokémon pela inspiração!

---

<div align="center">

**⭐ Se você gostou do projeto, deixe uma estrela! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/MatheusFoliatti/Poke-IA?style=social)](https://MatheusFoliatti/Poke-IA)

**Gotta catch 'em all! 🔴**

</div>
