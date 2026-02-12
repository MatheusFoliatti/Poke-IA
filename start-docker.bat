@echo off
REM Pokédex AI - Start with Docker (Windows) - Smart Port Detection
REM PostgreSQL no Docker + Backend e Frontend no Windows

echo.
echo ============================================
echo    POKEDEX AI - INICIANDO COM DOCKER
echo ============================================
echo.

set PROJECT_DIR=%~dp0
cd /d %PROJECT_DIR%

REM 1. Verificar Docker
echo [1/5] Verificando Docker Desktop...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker nao encontrado!
    echo     Por favor, inicie o Docker Desktop
    pause
    exit /b 1
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker Desktop nao esta rodando!
    echo     Por favor, abra o Docker Desktop e aguarde iniciar
    pause
    exit /b 1
)

echo [OK] Docker Desktop esta rodando
echo.

REM 2. Verificar/Criar PostgreSQL Container
echo [2/5] Configurando PostgreSQL no Docker...

REM Verificar se já existe um container com este nome
docker ps -a | findstr pokedex-postgres >nul 2>&1
if %errorlevel% == 0 (
    echo [!] Container 'pokedex-postgres' ja existe
    
    REM Verificar se está rodando
    docker ps | findstr pokedex-postgres >nul 2>&1
    if %errorlevel% == 0 (
        echo [OK] PostgreSQL ja esta rodando
    ) else (
        echo [!] Iniciando PostgreSQL...
        docker start pokedex-postgres >nul 2>&1
        timeout /t 3 >nul
        echo [OK] PostgreSQL iniciado
    )
    goto :ollama_check
)

REM Container não existe, verificar se porta 5432 está livre
echo [!] Verificando porta 5432...
netstat -ano | findstr :5432 | findstr LISTENING >nul 2>&1
if %errorlevel% == 0 (
    echo.
    echo =============================================
    echo  [!] PORTA 5432 JA ESTA EM USO
    echo =============================================
    echo.
    echo Voce tem PostgreSQL instalado no Windows!
    echo.
    echo Opcoes disponiveis:
    echo   1 - Usar porta alternativa 5433 (Docker)
    echo   2 - Usar SQLite (sem PostgreSQL)
    echo   3 - Cancelar e parar PostgreSQL do Windows
    echo.
    
    set /p CHOICE="Escolha uma opcao (1/2/3): "
    echo.
    
    if "%CHOICE%"=="1" (
        echo [OK] Usando porta alternativa 5433...
        set PG_PORT=5433
        set DATABASE_URL=postgresql://pokedex_user:pokedex_pass@localhost:5433/pokedex_db
        goto :create_container
    )
    
    if "%CHOICE%"=="2" (
        echo [OK] Redirecionando para modo SQLite...
        timeout /t 2 >nul
        start-simple.bat
        exit /b 0
    )
    
    if "%CHOICE%"=="3" (
        echo.
        echo Para parar PostgreSQL do Windows:
        echo.
        echo 1. Abra outro terminal como Administrador
        echo 2. Execute um destes comandos:
        echo.
        echo    sc stop postgresql-x64-15
        echo    ou
        echo    net stop postgresql-x64-15
        echo.
        echo 3. Depois execute este script novamente
        echo.
        pause
        exit /b 1
    )
    
    echo [X] Opcao invalida
    pause
    exit /b 1
) else (
    echo [OK] Porta 5432 esta livre
    set PG_PORT=5432
    set DATABASE_URL=postgresql://pokedex_user:pokedex_pass@localhost:5432/pokedex_db
)

:create_container
echo [!] Criando container PostgreSQL na porta %PG_PORT%...
docker run -d --name pokedex-postgres -e POSTGRES_DB=pokedex_db -e POSTGRES_USER=pokedex_user -e POSTGRES_PASSWORD=pokedex_pass -p %PG_PORT%:5432 postgres:15-alpine

if %errorlevel% == 0 (
    echo [OK] Container criado com sucesso
    echo [!] Aguardando PostgreSQL inicializar...
    timeout /t 5 >nul
    echo [OK] PostgreSQL pronto na porta %PG_PORT%
) else (
    echo [X] Erro ao criar container
    pause
    exit /b 1
)

:ollama_check
echo.

REM 3. Verificar Ollama
echo [3/5] Verificando Ollama...
where ollama >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Ollama encontrado
    
    tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo [OK] Ollama ja esta rodando
    ) else (
        echo [!] Iniciando Ollama...
        start "Ollama Server" ollama serve
        timeout /t 3 >nul
        echo [OK] Ollama iniciado
    )
    
    ollama list | findstr "llama3.2\|llama2" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [!] Modelo nao encontrado. Baixando llama3.2...
        ollama pull llama3.2
    )
    echo [OK] Modelo disponivel
) else (
    echo [X] Ollama nao encontrado!
    pause
    exit /b 1
)
echo.

REM 4. Iniciar Backend
echo [4/5] Iniciando Backend (FastAPI)...
cd /d "%PROJECT_DIR%backend"

if not exist "venv" (
    echo [!] Criando ambiente virtual...
    python -m venv venv
)

call venv\Scripts\activate

REM Configurar .env
if defined DATABASE_URL (
    (
        echo DATABASE_URL=%DATABASE_URL%
        echo SECRET_KEY=dev-secret-key-change-in-production
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo OLLAMA_BASE_URL=http://localhost:11434
        echo OLLAMA_MODEL=llama3.2
        echo POKEAPI_BASE_URL=https://pokeapi.co/api/v2
        echo CORS_ORIGINS=["http://localhost:5173"]
    ) > .env
) else if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
    )
)

echo [!] Instalando dependencias...
pip install -q -r requirements.txt

echo [!] Iniciando servidor FastAPI...
start "Pokedex Backend" cmd /k "cd /d %PROJECT_DIR%backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 >nul
echo [OK] Backend iniciado
echo.

REM 5. Iniciar Frontend
echo [5/5] Iniciando Frontend...
cd /d "%PROJECT_DIR%frontend"

if not exist "node_modules" (
    echo [!] Instalando dependencias...
    call npm install
)

if not exist ".env" (
    echo VITE_API_BASE_URL=http://localhost:8000 > .env
)

echo [!] Iniciando servidor Vite...
start "Pokedex Frontend" cmd /k "cd /d %PROJECT_DIR%frontend && npm run dev"
timeout /t 3 >nul
echo [OK] Frontend iniciado
echo.

timeout /t 5 >nul

echo ============================================
echo   SUCESSO! SERVICOS INICIADOS
echo ============================================
echo.
if defined PG_PORT (
    echo PostgreSQL: Container Docker (porta %PG_PORT%)
) else (
    echo PostgreSQL: Container Docker (porta 5432)
)
echo Backend:    http://localhost:8000
echo Frontend:   http://localhost:5173
echo API Docs:   http://localhost:8000/docs
echo.
echo Para parar: stop.bat
echo.

set /p OPEN="Abrir navegador? (s/n): "
if /i "%OPEN%"=="s" (
    start http://localhost:5173
)

pause