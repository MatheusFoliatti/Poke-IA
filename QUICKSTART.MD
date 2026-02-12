# 🚀 Guia Rápido de Instalação

## Opção 1: Instalação Rápida com Docker (Recomendado)

### Pré-requisitos

- Docker e Docker Compose instalados
- Ollama rodando localmente

### Passos

1. **Clone o repositório**

```bash
git clone <seu-repo>
cd pokedex-ai
```

2. **Inicie o Ollama** (em outro terminal)

```bash
ollama serve
ollama pull llama3.2
```

3. **Inicie os containers**

```bash
docker-compose up -d
```

4. **Acesse a aplicação**

- Frontend: http://localhost
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Rebuild
docker-compose up -d --build

# Acessar o banco de dados
docker-compose exec postgres psql -U pokedex_user -d pokedex_db
```

---

## Opção 2: Instalação Manual

### Backend

1. **Criar ambiente virtual**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate no Windows
```

2. **Instalar dependências**

```bash
pip install -r requirements.txt
```

3. **Configurar banco de dados**

```bash
# Entrar no PostgreSQL
psql -U postgres

# Criar banco e usuário
CREATE DATABASE pokedex_db;
CREATE USER pokedex_user WITH PASSWORD 'pokedex_pass';
GRANT ALL PRIVILEGES ON DATABASE pokedex_db TO pokedex_user;
\q
```

4. **Configurar .env**

```bash
cp .env.example .env
# Editar .env com suas configurações
```

5. **Executar migrations** (quando implementadas)

```bash
alembic upgrade head
```

6. **Iniciar servidor**

```bash
uvicorn app.main:app --reload
```

### Frontend

1. **Instalar dependências**

```bash
cd frontend
npm install
```

2. **Configurar .env**

```bash
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

3. **Iniciar servidor de desenvolvimento**

```bash
npm run dev
```

### Ollama

1. **Instalar Ollama**

```bash
# Linux/Mac
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: baixe do site oficial
```

2. **Baixar modelo**

```bash
ollama pull llama3.2
# ou llama2 para versão mais leve
```

3. **Iniciar servidor**

```bash
ollama serve
```

---

## 🧪 Testando a Instalação

1. **Teste o Backend**

```bash
curl http://localhost:8000/health
```

2. **Teste o Ollama**

```bash
curl http://localhost:11434/api/tags
```

3. **Acesse o Frontend**

```
http://localhost:5173
```

4. **Crie uma conta**

- Clique em "Registre-se"
- Preencha username, email e senha
- Faça login

5. **Teste o Chat**

- Pergunte: "Me fale sobre Pikachu"
- Experimente: "Sugira um time balanceado"

---

## 🔧 Troubleshooting

### Erro de conexão com o banco de dados

```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql  # Linux
brew services list  # Mac

# Verifique credenciais no .env
```

### Ollama não responde

```bash
# Verifique se está rodando
curl http://localhost:11434/api/tags

# Reinicie o serviço
pkill ollama
ollama serve
```

### Porta já em uso

```bash
# Backend (8000)
lsof -ti:8000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### CORS Error

- Verifique se `CORS_ORIGINS` no backend inclui a URL do frontend
- Certifique-se de que ambos estão rodando

---

## 📚 Próximos Passos

1. **Explore a API**: http://localhost:8000/docs
2. **Teste diferentes queries**:
   - "Quais são os melhores Pokémon do tipo Fogo?"
   - "Monte um time para derrotar o campeão"
   - "Compare Charizard e Blastoise"
3. **Veja o histórico de conversas**
4. **Experimente buscar Pokémon específicos**

---

## 💡 Dicas

- Use **llama3.2** para melhor performance (requer mais RAM)
- Use **llama2** para versão mais leve
- Limpe o histórico regularmente para melhor contexto
- Seja específico nas perguntas para respostas melhores

Divirta-se explorando o mundo Pokémon com IA! 🔴✨
