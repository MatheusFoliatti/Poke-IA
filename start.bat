@echo off
REM Pokédex AI - Start All Services (Windows)
REM Este script inicia todos os serviços necessários para rodar a aplicação

echo.
echo ============================================
echo    POKEDEX AI - INICIANDO SERVICOS
echo ============================================
echo.

REM Obter diretório do projeto
set PROJECT_DIR=%~dp0
cd /d %PROJECT_DIR%

REM 1. Verificar PostgreSQL
echo [1/6] Verificando PostgreSQL...
sc query postgresql >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] PostgreSQL esta rodando
) else (
    echo [!] PostgreSQL nao encontrado ou nao esta rodando
    echo     Por favor, inicie o PostgreSQL manualmente
    pause
)
echo.

REM 2. Verificar Ollama
echo [2/6] Verificando Ollama...
where ollama >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Ollama encontrado
    
    REM Verificar se Ollama está rodando
    tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo [OK] Ollama ja esta rodando
    ) else (
        echo [!] Iniciando Ollama...
        start "Ollama Server" ollama serve
        timeout /t 3 >nul
        echo [OK] Ollama iniciado
    )
) else (
    echo [X] Ollama nao encontrado!
    echo     Por favor, instale em: https://ollama.ai/
    pause
    exit /b 1
)
echo.

REM 3. Verificar banco de dados
echo [3/6] Verificando banco de dados...
psql -U postgres -lqt 2>nul | findstr /C:"pokedex_db" >nul
if %errorlevel% == 0 (
    echo [OK] Banco de dados 'pokedex_db' existe
) else (
    echo [!] Criando banco de dados...
    psql -U postgres -c "CREATE DATABASE pokedex_db;" 2>nul
    psql -U postgres -c "CREATE USER pokedex_user WITH PASSWORD 'pokedex_pass';" 2>nul
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE pokedex_db TO pokedex_user;" 2>nul
    echo [OK] Banco de dados criado
)
echo.

REM 4. Iniciar Backend
echo [4/6] Iniciando Backend (FastAPI)...
cd /d "%PROJECT_DIR%backend"

if not exist "venv" (
    echo [X] Ambiente virtual nao encontrado!
    echo     Execute setup.bat primeiro
    pause
    exit /b 1
)

echo [!] Iniciando servidor FastAPI na porta 8000...
start "Pokedex Backend" cmd /k "cd /d %PROJECT_DIR%backend && venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 >nul
echo [OK] Backend iniciado
echo.

REM 5. Iniciar Frontend
echo [5/6] Iniciando Frontend (React + Vite)...
cd /d "%PROJECT_DIR%frontend"

if not exist "node_modules" (
    echo [X] Dependencias nao encontradas!
    echo     Execute npm install primeiro
    pause
    exit /b 1
)

echo [!] Iniciando servidor Vite na porta 5173...
start "Pokedex Frontend" cmd /k "cd /d %PROJECT_DIR%frontend && npm run dev"
timeout /t 3 >nul
echo [OK] Frontend iniciado
echo.

REM 6. Aguardar serviços
echo [6/6] Aguardando servicos iniciarem...
timeout /t 5 >nul
echo.

REM Resumo
echo ============================================
echo   TODOS OS SERVICOS INICIADOS COM SUCESSO!
echo ============================================
echo.
echo =============================================
echo  RESUMO DOS SERVICOS
echo =============================================
echo.
echo  PostgreSQL:     Rodando
echo  Ollama:         http://localhost:11434
echo  Backend API:    http://localhost:8000
echo  Frontend:       http://localhost:5173
echo.
echo =============================================
echo  LINKS UTEIS
echo =============================================
echo.
echo  Aplicacao:      http://localhost:5173
echo  API Docs:       http://localhost:8000/docs
echo  ReDoc:          http://localhost:8000/redoc
echo  Health Check:   http://localhost:8000/health
echo.
echo =============================================
echo  COMO USAR
echo =============================================
echo.
echo  1. Acesse: http://localhost:5173
echo  2. Clique em 'Registre-se' e crie uma conta
echo  3. Faca login com suas credenciais
echo  4. Aproveite a Pokedex AI!
echo.
echo =============================================
echo  PARA PARAR OS SERVICOS
echo =============================================
echo.
echo  Execute: stop.bat
echo  Ou feche as janelas dos terminais
echo.
echo =============================================
echo.

REM Perguntar se quer abrir o navegador
set /p OPEN_BROWSER="Deseja abrir o navegador automaticamente? (s/n): "
if /i "%OPEN_BROWSER%"=="s" (
    timeout /t 2 >nul
    start http://localhost:5173
    echo [OK] Navegador aberto!
)

echo.
echo Gotta catch 'em all!
echo.
echo Pressione qualquer tecla para sair...
pause >nul