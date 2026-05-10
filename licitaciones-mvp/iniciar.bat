@echo off
echo.
echo  =============================================
echo   AudiGov - Iniciando servidor...
echo  =============================================
echo.

:: Abre el navegador automaticamente despues de 2 segundos
start "" timeout /t 2 >nul && start "" "http://localhost:3000"

:: Inicia el servidor apuntando al frontend
npx serve frontend
