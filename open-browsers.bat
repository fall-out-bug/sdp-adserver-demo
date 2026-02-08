@echo off
REM Открывает все порталы в браузере по умолчанию
REM
echo Opening AdServer Portals...
echo.
echo 1. Publisher Portal (Регистрация издателей)
start http://localhost:3001
timeout /t 1 /nobreak >nul

echo 2. Advertiser Portal (Регистрация рекламодателей)
start http://localhost:3002
timeout /t 1 /nobreak >nul

echo 3. Demo Website (Показ рекламы)
start http://localhost:3000
timeout /t 1 /nobreak >nul

echo 4. Backend API Health
start http://localhost:8080/health
timeout /t 1 /nobreak >nul

echo.
echo All portals opened in browser!
echo.
echo ================================================
echo AdServer Portals
echo ================================================
echo.
echo Publisher Portal:    http://localhost:3001
echo Advertiser Portal:   http://localhost:3002
echo Demo Website:        http://localhost:3000
echo Backend API:         http://localhost:8080
echo.
echo ================================================
echo Test Flows
echo ================================================
echo.
echo 1. РЕГИСТРАЦИЯ ИЗДАТЕЛЯ (Publisher):
echo    - Откройте http://localhost:3001
echo    - Нажмите "Register" или "Sign Up"
echo    - Заполните форму регистрации
echo    - После регистрации войдите в систему
echo.
echo 2. РЕГИСТРАЦИЯ РЕКЛАМОДАТЕЛЯ (Advertiser):
echo    - Откройте http://localhost:3002
echo    - Нажмите "Register" или "Sign Up"
echo    - Заполните форму регистрации
echo    - После регистрации войдите в систему
echo.
echo 3. ПРОСМОТР РЕКЛАМЫ (Demo):
echo    - Откройте http://localhost:3000
echo    - Перейдите на /demo страницу
echo    - Баннеры загружаются автоматически
echo.
pause
