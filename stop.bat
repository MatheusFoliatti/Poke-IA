@echo off
REM Pokédex AI - Stop All Services (Windows)
REM Este script para todos os serviços da aplicação

echo.
echo ============================================
echo    POKEDEX AI - PARANDO SERVICOS
echo ============================================
echo.

set STOPPED_COUNT=0

REM 1. Parar Frontend (porta 5173)
echo [1/4] Parando Frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! == 0 (
        echo [OK] Processo na porta 5173 parado
        set /a STOPPED_COUNT+=1
    )
)

REM Também parar processos node relacionados ao Vite
tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq Pokedex Frontend*" >nul 2>&1
if %errorlevel% == 0 (
    taskkill /F /FI "WINDOWTITLE eq Pokedex Frontend*" >nul 2>&1
    echo [OK] Frontend parado
    set /a STOPPED_COUNT+=1
) else (
    echo [!] Frontend nao estava rodando
)
echo.

REM 2. Parar Backend (porta 8000)
echo [2/4] Parando Backend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    if !errorlevel! == 0 (
        echo [OK] Processo na porta 8000 parado
        set /a STOPPED_COUNT+=1
    )
)

REM Também parar processos Python/uvicorn
tasklist /FI "IMAGENAME eq python.exe" /FI "WINDOWTITLE eq Pokedex Backend*" >nul 2>&1
if %errorlevel% == 0 (
    taskkill /F /FI "WINDOWTITLE eq Pokedex Backend*" >nul 2>&1
    echo [OK] Backend parado
    set /a STOPPED_COUNT+=1
) else (
    echo [!] Backend nao estava rodando
)
echo.

REM 3. Parar Ollama (opcional)
echo [3/4] Gerenciando Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    set /p STOP_OLLAMA="Deseja parar o Ollama tambem? (s/n): "
    if /i "!STOP_OLLAMA!"=="s" (
        echo [!] Parando Ollama...
        taskkill /F /IM ollama.exe >nul 2>&1
        echo [OK] Ollama parado
        set /a STOPPED_COUNT+=1
    ) else (
        echo [!] Ollama continuara rodando
    )
) else (
    echo [!] Ollama nao esta rodando
)
echo.

REM 4. Parar PostgreSQL (opcional)
echo [4/4] Gerenciando PostgreSQL...
sc query postgresql >nul 2>&1
if %errorlevel% == 0 (
    set /p STOP_POSTGRES="Deseja parar o PostgreSQL tambem? (s/n): "
    if /i "!STOP_POSTGRES!"=="s" (
        echo [!] Parando PostgreSQL...
        net stop postgresql >nul 2>&1
        echo [OK] PostgreSQL parado
        set /a STOPPED_COUNT+=1
    ) else (
        echo [!] PostgreSQL continuara rodando
    )
) else (
    echo [!] PostgreSQL nao esta rodando
)
echo.

REM Resumo
echo ============================================
echo   PROCESSO DE PARADA CONCLUIDO
echo ============================================
echo.

if %STOPPED_COUNT% GTR 0 (
    echo Servicos parados: %STOPPED_COUNT%
) else (
    echo Nenhum servico estava rodando
)

echo.
echo =============================================
echo  STATUS DOS SERVICOS
echo =============================================
echo.

REM Verificar status de cada serviço
netstat -aon | findstr :5173 | findstr LISTENING >nul 2>&1
if %errorlevel% == 0 (
    echo [X] Frontend: Ainda rodando (porta 5173^)
) else (
    echo [OK] Frontend: Parado
)

netstat -aon | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel% == 0 (
    echo [X] Backend: Ainda rodando (porta 8000^)
) else (
    echo [OK] Backend: Parado
)

tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [!] Ollama: Rodando
) else (
    echo [OK] Ollama: Parado
)

sc query postgresql | findstr RUNNING >nul 2>&1
if %errorlevel% == 0 (
    echo [!] PostgreSQL: Rodando
) else (
    echo [OK] PostgreSQL: Parado
)

echo.
echo =============================================
echo.
echo Para iniciar novamente: start.bat
echo.
echo Pressione qualquer tecla para sair...
pause >nul