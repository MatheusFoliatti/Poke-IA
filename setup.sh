#!/bin/bash

# Pokédex AI - Setup Script
# Este script automatiza a instalação e configuração do projeto

set -e

echo "🔴 Bem-vindo ao Pokédex AI Setup! 🔴"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verifica se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar pré-requisitos
echo "1️⃣  Verificando pré-requisitos..."
echo ""

if ! command_exists python3; then
    print_error "Python 3 não encontrado. Por favor, instale Python 3.11+"
    exit 1
fi
print_success "Python encontrado: $(python3 --version)"

if ! command_exists node; then
    print_error "Node.js não encontrado. Por favor, instale Node.js 18+"
    exit 1
fi
print_success "Node.js encontrado: $(node --version)"

if ! command_exists psql; then
    print_error "PostgreSQL não encontrado. Por favor, instale PostgreSQL 15+"
    exit 1
fi
print_success "PostgreSQL encontrado"

if ! command_exists ollama; then
    print_error "Ollama não encontrado. Por favor, instale Ollama"
    echo "   Visite: https://ollama.ai/"
    exit 1
fi
print_success "Ollama encontrado"

echo ""
echo "2️⃣  Configurando Backend..."
echo ""

# 2. Setup Backend
cd backend

# Criar ambiente virtual
if [ ! -d "venv" ]; then
    print_info "Criando ambiente virtual Python..."
    python3 -m venv venv
    print_success "Ambiente virtual criado"
else
    print_info "Ambiente virtual já existe"
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
print_info "Instalando dependências Python..."
pip install -q -r requirements.txt
print_success "Dependências instaladas"

# Criar .env se não existir
if [ ! -f ".env" ]; then
    print_info "Criando arquivo .env..."
    cp .env.example .env
    
    # Gerar SECRET_KEY aleatória
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i.bak "s/your-super-secret-key-change-this-in-production/$SECRET_KEY/" .env
    rm .env.bak
    
    print_success "Arquivo .env criado com SECRET_KEY segura"
else
    print_info "Arquivo .env já existe"
fi

cd ..

echo ""
echo "3️⃣  Configurando Banco de Dados..."
echo ""

# 3. Setup Database
print_info "Criando banco de dados..."

# Verificar se banco já existe
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw pokedex_db; then
    print_info "Banco de dados 'pokedex_db' já existe"
else
    psql -U postgres -c "CREATE DATABASE pokedex_db;" 2>/dev/null || true
    psql -U postgres -c "CREATE USER pokedex_user WITH PASSWORD 'pokedex_pass';" 2>/dev/null || true
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE pokedex_db TO pokedex_user;" 2>/dev/null || true
    print_success "Banco de dados criado"
fi

echo ""
echo "4️⃣  Configurando Frontend..."
echo ""

# 4. Setup Frontend
cd frontend

if [ ! -d "node_modules" ]; then
    print_info "Instalando dependências Node.js..."
    npm install
    print_success "Dependências instaladas"
else
    print_info "Dependências já instaladas"
fi

# Criar .env se não existir
if [ ! -f ".env" ]; then
    print_info "Criando arquivo .env..."
    cp .env.example .env
    print_success "Arquivo .env criado"
else
    print_info "Arquivo .env já existe"
fi

cd ..

echo ""
echo "5️⃣  Baixando modelo Llama..."
echo ""

# 5. Download Llama model
print_info "Verificando modelo Llama..."
if ollama list | grep -q "llama3.2"; then
    print_success "Modelo llama3.2 já instalado"
else
    print_info "Baixando modelo llama3.2 (isso pode demorar)..."
    ollama pull llama3.2
    print_success "Modelo baixado"
fi

echo ""
echo "======================================"
echo "✅ Setup concluído com sucesso!"
echo "======================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Inicie o Ollama (se não estiver rodando):"
echo "   $ ollama serve"
echo ""
echo "2. Em outro terminal, inicie o Backend:"
echo "   $ cd backend"
echo "   $ source venv/bin/activate"
echo "   $ uvicorn app.main:app --reload"
echo ""
echo "3. Em outro terminal, inicie o Frontend:"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "4. Acesse: http://localhost:5173"
echo ""
echo "📚 Documentação completa: README.md"
echo "🚀 Guia rápido: QUICKSTART.md"
echo ""
echo "Gotta catch 'em all! 🔴"