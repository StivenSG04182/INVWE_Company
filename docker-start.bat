@echo off
echo Iniciando INVWE Company con Docker...

echo Verificando si Docker está instalado...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está en el PATH.
    echo Por favor, instala Docker Desktop desde https://www.docker.com/products/docker-desktop/
    pause
    exit /b
)

echo Construyendo y ejecutando contenedores Docker...
docker-compose up --build

pause