# 🔴 Pokédex AI - Intelligent Pokémon Assistant

<div align="center">

![Pokédex AI Banner](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png)

**Uma Pokédex inteligente alimentada por IA que fornece informações detalhadas sobre Pokémon, comparações, geração de equipes competitivas e muito mais!**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com/)
[![Llama](https://img.shields.io/badge/LLM-Llama_3-FF6B6B.svg)](https://ollama.ai/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

[🚀 Demo](#-screenshots) • [📖 Documentação](#-índice) • [💻 Instalação](#-instalação) • [🤝 Contribuir](#-contribuindo)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Agradecimentos](#-agradecimentos)

---

## 🎯 Sobre o Projeto

A **Pokédex AI** é uma aplicação web full-stack moderna que revoluciona a experiência de explorar o universo Pokémon. Combinando a clássica Pokédex com o poder da inteligência artificial (Llama 3), oferecemos uma experiência interativa e inteligente onde treinadores podem:

- 🔍 **Buscar Pokémon** com autocomplete inteligente e correção de erros
- ⚔️ **Comparar estatísticas** entre dois Pokémon
- 🎯 **Montar equipes competitivas** com filtros avançados
- 🤖 **Conversar com IA** especializada em Pokémon
- 📊 **Analisar stats, tipos e estratégias** de batalha
- 💾 **Manter histórico** de conversas personalizado

### 🎨 Experiência Visual Única

- **Animação de abertura da Pokédex** após login
- **Interface com sistema de abas** (Buscar, Comparar, Montar Equipe)
- **Autocomplete com sprites** dos Pokémon em tempo real
- **Modais personalizados** para ações críticas
- **Design responsivo** otimizado para mobile e desktop

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança

- ✅ Sistema de login/registro seguro com bcrypt
- ✅ Autenticação JWT com refresh automático
- ✅ Sessões persistentes com Zustand
- ✅ Renovação automática de tokens expirados
- ✅ Logout com confirmação em modal

### 🔍 Busca Inteligente de Pokémon

- ✅ **Autocomplete com 1350+ Pokémon** (incluindo Megas)
- ✅ **Fuzzy Matching** - Correção automática de erros (ex: "pikaxu" → "pikachu")
- ✅ **Sprites em tempo real** nas sugestões
- ✅ **Navegação por teclado** (↑↓, Enter, Esc)
- ✅ **Posicionamento inteligente** (abre acima ou abaixo conforme espaço)
- ✅ **Cache pré-carregado** no startup (1350+ nomes)
- ✅ **Busca por nome formatado** (ex: "Charizard Mega X")

#### 🔧 Técnicas de Correção

1. **Dicionário de erros comuns** (arboc → arbok, mewtwu → mewtwo)
2. **Fuzzy matching 75%** (alta precisão)
3. **Fuzzy matching 60%** (mais flexível)
4. **Busca por prefixo** (primeiros 4 caracteres)

### ⚔️ Comparação de Pokémon

- ✅ Compare dois Pokémon lado a lado
- ✅ Análise automática de maior ataque, defesa, velocidade e HP
- ✅ Recomendação do melhor baseado em stats totais
- ✅ Diferença de pontos entre os Pokémon

### 🎯 Montador de Equipes Competitivas

- ✅ **Filtros por Tipo** (Fire, Water, Grass, Electric, etc.)
- ✅ **Estratégias de Batalha**: Ofensiva, Defensiva, Velocidade, Balanceada
- ✅ **Apenas Pokémon Totalmente Evoluídos** - Sem estágios iniciais
- ✅ **Regra de 1 Mega por Equipe** (limitação competitiva)
- ✅ **Anti-repetição** - Equipes sempre diferentes
- ✅ **Análise automática**: Cobertura de tipos, papéis, stats médias

### 🤖 Chatbot com IA (Llama 3)

- ✅ Respostas contextuais sobre Pokémon
- ✅ Sugestões de perguntas rápidas
- ✅ Análise de fraquezas e resistências
- ✅ Histórico de conversas por usuário
- ✅ Fallback inteligente quando IA offline

### 📊 Dashboard e Estatísticas

- ✅ Contador de mensagens totais
- ✅ Contador de Pokémon consultados
- ✅ Status online em tempo real
- ✅ Avatar personalizado com inicial do username
- ✅ Botões de sugestões rápidas

### 🎨 Interface Moderna

- ✅ **Sistema de abas** (Buscar, Comparar, Equipe)
- ✅ **Modais personalizados** (danger, warning, info)
- ✅ **Animações suaves** (fade, slide, scale)
- ✅ **Design responsivo** (mobile-first)
- ✅ **Sprites oficiais** do GitHub PokeAPI
- ✅ **Lazy loading** de imagens

---

## 🛠 Tecnologias Utilizadas

### Backend

- **Python 3.11+** - Linguagem principal
- **FastAPI 0.104+** - Framework web assíncrono
- **SQLAlchemy 2.0+** - ORM para banco de dados
- **PostgreSQL 15+** - Banco de dados relacional
- **Ollama/Llama 3.2** - Modelo de linguagem local
- **JWT (PyJWT)** - Autenticação segura
- **HTTPX 0.25+** - Cliente HTTP assíncrono
- **Bcrypt 4.0+** - Hash de senhas
- **Uvicorn 0.24+** - Servidor ASGI
- **Pydantic 2.0+** - Validação de dados
- **Alembic 1.12+** - Migrações de banco

### Frontend

- **React 18.2+** - Biblioteca UI
- **TypeScript 5.0+** - Tipagem estática
- **Vite 5.0+** - Build tool e dev server
- **Zustand 4.4+** - Gerenciamento de estado
- **Axios 1.6+** - Cliente HTTP
- **React Router 6.18+** - Roteamento
- **Tailwind CSS 3.4+** - Estilização utilitária

### Infraestrutura

- **Docker & Docker Compose** - Containerização
- **Nginx** - Proxy reverso (produção)
- **Git** - Controle de versão

---

## 🏗 Arquitetura

### Fluxo de Dados

#### Busca de Pokémon com Fuzzy Matching

```
User Input: "pikaxu"
    ↓
Frontend Autocomplete Component
    ↓
Backend /api/chat/pokemon-list → CACHE (1350+ names)
    ↓
Fuzzy Matching Engine
    1. Check manual typo dictionary
    2. Difflib 75% similarity
    3. Difflib 60% similarity
    4. Prefix match (4 chars)
    ↓
Return: "pikachu" with sprite
    ↓
Frontend Display suggestion with image
```

#### Geração de Equipe Competitiva

```
User: "Monte uma equipe de fire offensive"
    ↓
Chat Service detects: Type=fire, Strategy=offensive
    ↓
PokeAPI Service get_fully_evolved_pokemon()
    ↓
For each Pokemon:
    1. Check if fully evolved
    2. Check if Mega (limit 1 per team)
    3. Apply strategy filter
    4. Avoid last team IDs
    ↓
Generate 6 Pokemon team with analysis
    ↓
Return to Frontend with 6 cards
```

#### JWT Refresh Automático

```
User makes request with expired token
    ↓
Axios Interceptor Detects 401
    ↓
Interceptor Calls /api/auth/refresh
    ↓
Backend Validates → Issues new token
    ↓
Interceptor Updates token in store
    ↓
Retry original request
    ↓
Success!
```

---

## 📦 Pré-requisitos

### Obrigatórios

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

### Opcionais

- **Ollama** - [Download](https://ollama.ai/) (para IA local)
- **Docker** - [Download](https://www.docker.com/)

### Instalando Ollama e Llama 3

```bash
# Linux/Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar modelo
ollama pull llama3.2

# Verificar
ollama list
```

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/MatheusFoliatti/Poke-IA.git
cd Poke-IA
```

### 2. Configure o Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuração

### 1. Banco de Dados

```bash
psql -U postgres

CREATE DATABASE pokedex_db;
CREATE USER pokedex_user WITH PASSWORD 'pokedex_pass';
GRANT ALL PRIVILEGES ON DATABASE pokedex_db TO pokedex_user;

# PostgreSQL 15+
\c pokedex_db
GRANT ALL ON SCHEMA public TO pokedex_user;
\q
```

### 2. Backend .env

```env
DATABASE_URL=postgresql://pokedex_user:pokedex_pass@localhost:5432/pokedex_db
SECRET_KEY=sua_chave_secreta_super_segura_de_pelo_menos_32_caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
CORS_ORIGINS=["http://localhost:5173"]
ENVIRONMENT=development
```

### 3. Frontend .env

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Migrações

```bash
cd backend
alembic upgrade head
```

---

## 🎮 Executando o Projeto

### Desenvolvimento

**Terminal 1 - Ollama:**

```bash
ollama serve
```

**Terminal 2 - Backend:**

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
```

**Acesse:** http://localhost:5173

### Docker Compose

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## 📁 Estrutura do Projeto

```
Poke-IA/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/
│   │   │   ├── auth.py
│   │   │   └── chat.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── llm.py
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   └── database.py
│   │   ├── services/
│   │   │   ├── pokeapi.py
│   │   │   └── chat_service.py
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Pokedex/
│   │   │   ├── Chat/
│   │   │   ├── Tabs/
│   │   │   ├── Autocomplete/
│   │   │   └── Modal/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── .env
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint           | Auth    | Descrição         |
| ------ | ------------------ | ------- | ----------------- |
| POST   | /api/auth/register | Público | Registrar usuário |
| POST   | /api/auth/login    | Público | Login e obter JWT |
| POST   | /api/auth/refresh  | Privado | Renovar token     |
| GET    | /api/auth/me       | Privado | Dados do usuário  |

### Chat e Pokémon

| Método | Endpoint               | Auth    | Descrição               |
| ------ | ---------------------- | ------- | ----------------------- |
| POST   | /api/chat/message      | Privado | Enviar mensagem         |
| GET    | /api/chat/history      | Privado | Obter histórico         |
| DELETE | /api/chat/history      | Privado | Limpar histórico        |
| GET    | /api/chat/pokemon-list | Público | Lista para autocomplete |

---

## 📸 Screenshots

### Tela de Login

![Login](assets/Login.png)

### Interface Principal

![Visual](assets/Visual.png)

### Interface de Montagem de Equipe

![Visual](assets/MontarEquipe.png)

### Interface de Comparação de Pokemon

![Visual](assets/ComparaPokemon.png)
![Visual](assets/ComparaPokemonChat.png)

### Interface de Busca Pokemon

![Visual](assets/BuscarPokemon.png)

---

## 🗺 Roadmap

### ✅ v2.0 - Atual

- [x] Sistema de autenticação JWT
- [x] Refresh token automático
- [x] Sistema de abas
- [x] Autocomplete com fuzzy matching
- [x] Geração de equipes competitivas
- [x] Apenas Pokémon evoluídos
- [x] Regra de 1 Mega por equipe
- [x] Comparação de stats
- [x] Modais personalizados
- [x] Design responsivo

### 🚧 v2.1 - Próxima

- [ ] Testes unitários
- [ ] CI/CD com GitHub Actions
- [ ] Documentação Swagger
- [ ] Sistema de favoritos
- [ ] Modo escuro

### 🎯 v3.0 - Futuro

- [ ] App React Native
- [ ] Calculadora de dano
- [ ] Simulador de batalhas
- [ ] Sistema de amigos
- [ ] PWA offline-first

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas!

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Add: Nova feature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

### Padrões de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 🙏 Agradecimentos

- [PokéAPI](https://pokeapi.co/) - API incrível de Pokémon
- [Ollama](https://ollama.ai/) - Framework LLM local
- [FastAPI](https://fastapi.tiangolo.com/) - Framework moderno
- [React](https://reactjs.org/) - Biblioteca UI
- Comunidade Pokémon pela inspiração

---

## 👨‍💻 Autor

<div align="center">

**Matheus Foliatti**

[![GitHub](https://img.shields.io/badge/GitHub-MatheusFoliatti-181717?style=for-the-badge&logo=github)](https://github.com/MatheusFoliatti)

</div>

---

<div align="center">

### ⭐ Se você gostou do projeto, deixe uma estrela! ⭐

[![GitHub stars](https://img.shields.io/github/stars/MatheusFoliatti/Poke-IA?style=social)](https://github.com/MatheusFoliatti/Poke-IA)

**Desenvolvido com ❤️ e ⚡**

**Gotta catch 'em all! 🔴⚪**

</div>
