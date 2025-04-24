@echo off
echo Iniciando el proyecto...

echo Limpiando la carpeta .next...
rd /s /q .next 2>nul

echo Configurando variables de entorno...
set NODE_OPTIONS=--max-old-space-size=4096 --openssl-legacy-provider
set NODE_NO_WARNINGS=1

echo Ejecutando Next.js...
npx --yes next dev

pause