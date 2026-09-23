@echo off
setlocal ENABLEDELAYEDEXPANSION
REM =====================================================
REM Keycloak Utilities - Herramientas de Diagnostico
REM =====================================================

set "SCRIPT_DIR=%~dp0"

:menu
cls
echo.
echo ========================================================
echo         KEYCLOAK UTILITIES - HERRAMIENTAS
echo ========================================================
echo.
echo  1. Verificar Requisitos del Sistema
echo  2. Verificar Puerto Disponible
echo  3. Mostrar Version de Java
echo  4. Liberar Puerto (Matar Proceso)
echo  5. Ver Logs de Keycloak
echo  6. Limpiar Cache de Keycloak
echo  7. Verificar Configuracion
echo  8. Test de Conectividad
echo  9. Salir
echo.
echo ========================================================
set /p "OPTION=Selecciona una opcion (1-9): "

if "%OPTION%"=="1" goto :check_requirements
if "%OPTION%"=="2" goto :check_port
if "%OPTION%"=="3" goto :check_java
if "%OPTION%"=="4" goto :kill_port
if "%OPTION%"=="5" goto :view_logs
if "%OPTION%"=="6" goto :clean_cache
if "%OPTION%"=="7" goto :check_config
if "%OPTION%"=="8" goto :test_connectivity
if "%OPTION%"=="9" goto :end

echo [ERROR] Opcion invalida
timeout /t 2 >nul
goto :menu

REM ======================================================
REM 1. VERIFICAR REQUISITOS
REM ======================================================
:check_requirements
cls
echo.
echo ========================================================
echo  VERIFICACION DE REQUISITOS DEL SISTEMA
echo ========================================================
echo.

REM Cargar configuracion
if exist "%SCRIPT_DIR%keycloak-config.bat" (
    call "%SCRIPT_DIR%keycloak-config.bat"
) else (
    echo [WARNING] No se encuentra keycloak-config.bat
)

echo [INFO] Verificando Java...
where java >nul 2>&1
if ERRORLEVEL 1 (
    echo [ERROR] Java NO esta instalado o no esta en PATH
) else (
    java -version 2>&1
    echo [OK] Java instalado
)

echo.
echo [INFO] Verificando JAVA_HOME...
if defined JAVA_HOME (
    echo [OK] JAVA_HOME: %JAVA_HOME%
) else (
    echo [WARNING] JAVA_HOME no esta definido
)

echo.
echo [INFO] Verificando Keycloak...
if defined KEYCLOAK_HOME (
    if exist "%KEYCLOAK_HOME%" (
        echo [OK] KEYCLOAK_HOME existe: %KEYCLOAK_HOME%
        if exist "%KEYCLOAK_HOME%\bin\kc.bat" (
            echo [OK] kc.bat encontrado
        ) else (
            echo [ERROR] kc.bat NO encontrado
        )
    ) else (
        echo [ERROR] KEYCLOAK_HOME no existe: %KEYCLOAK_HOME%
    )
) else (
    echo [WARNING] KEYCLOAK_HOME no esta definido
)

echo.
pause
goto :menu

REM ======================================================
REM 2. VERIFICAR PUERTO
REM ======================================================
:check_port
cls
echo.
echo ========================================================
echo  VERIFICACION DE PUERTO
echo ========================================================
echo.

set /p "CHECK_PORT=Ingresa el puerto a verificar (default: 8080): "
if "%CHECK_PORT%"=="" set "CHECK_PORT=8080"

echo [INFO] Verificando puerto %CHECK_PORT%...
echo.

netstat -ano | findstr ":%CHECK_PORT%" | findstr "LISTENING"
if ERRORLEVEL 1 (
    echo [OK] Puerto %CHECK_PORT% esta DISPONIBLE
) else (
    echo [WARNING] Puerto %CHECK_PORT% esta EN USO
    echo.
    netstat -ano | findstr ":%CHECK_PORT%"
)

echo.
pause
goto :menu

REM ======================================================
REM 3. VER VERSION JAVA
REM ======================================================
:check_java
cls
echo.
echo ========================================================
echo  VERSION DE JAVA
echo ========================================================
echo.

where java >nul 2>&1
if ERRORLEVEL 1 (
    echo [ERROR] Java no encontrado en PATH
) else (
    echo [INFO] Ejecutando: java -version
    echo.
    java -version 2>&1
    echo.
    echo [INFO] Java Home:
    where java
)

echo.
pause
goto :menu

REM ======================================================
REM 4. LIBERAR PUERTO
REM ======================================================
:kill_port
cls
echo.
echo ========================================================
echo  LIBERAR PUERTO (MATAR PROCESO)
echo ========================================================
echo.
echo [WARNING] Esta operacion terminara el proceso forzadamente
echo.

set /p "KILL_PORT=Ingresa el puerto a liberar (default: 8080): "
if "%KILL_PORT%"=="" set "KILL_PORT=8080"

echo [INFO] Buscando proceso en puerto %KILL_PORT%...
echo.

set "PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%KILL_PORT%" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    goto :found_pid
)
:found_pid

if defined PID (
    echo [INFO] Proceso encontrado: PID %PID%
    echo.
    set /p "CONFIRM=Deseas terminar el proceso %PID%? (S/N): "
    if /I "!CONFIRM!"=="S" (
        taskkill /PID %PID% /F
        if ERRORLEVEL 1 (
            echo [ERROR] No se pudo terminar el proceso
        ) else (
            echo [OK] Proceso terminado exitosamente
        )
    ) else (
        echo [INFO] Operacion cancelada
    )
) else (
    echo [INFO] No hay ningun proceso usando el puerto %KILL_PORT%
)

echo.
pause
goto :menu

REM ======================================================
REM 5. VER LOGS
REM ======================================================
:view_logs
cls
echo.
echo ========================================================
echo  LOGS DE KEYCLOAK
echo ========================================================
echo.

if exist "%SCRIPT_DIR%keycloak-config.bat" (
    call "%SCRIPT_DIR%keycloak-config.bat"
)

if not defined KEYCLOAK_HOME (
    echo [ERROR] KEYCLOAK_HOME no esta definido
    echo [ERROR] No se puede localizar los logs
    pause
    goto :menu
)

set "LOG_DIR=%KEYCLOAK_HOME%\data\log"

if exist "%LOG_DIR%" (
    echo [INFO] Directorio de logs: %LOG_DIR%
    echo.
    dir "%LOG_DIR%\*.log" /o-d
    echo.
    echo [INFO] Para ver un log especifico, abrelo con:
    echo notepad "%LOG_DIR%\keycloak.log"
) else (
    echo [WARNING] Directorio de logs no encontrado: %LOG_DIR%
    echo [INFO] Los logs pueden estar en memoria (modo dev con H2)
)

echo.
pause
goto :menu

REM ======================================================
REM 6. LIMPIAR CACHE
REM ======================================================
:clean_cache
cls
echo.
echo ========================================================
echo  LIMPIAR CACHE DE KEYCLOAK
echo ========================================================
echo.
echo [WARNING] Esta operacion eliminara datos temporales
echo [WARNING] Asegurate de que Keycloak este detenido
echo.

if exist "%SCRIPT_DIR%keycloak-config.bat" (
    call "%SCRIPT_DIR%keycloak-config.bat"
)

if not defined KEYCLOAK_HOME (
    echo [ERROR] KEYCLOAK_HOME no esta definido
    pause
    goto :menu
)

set /p "CONFIRM=Deseas limpiar el cache? (S/N): "
if /I not "%CONFIRM%"=="S" (
    echo [INFO] Operacion cancelada
    pause
    goto :menu
)

echo.
echo [INFO] Limpiando cache...

set "DATA_DIR=%KEYCLOAK_HOME%\data"
set "TMP_DIR=%KEYCLOAK_HOME%\data\tmp"

if exist "%TMP_DIR%" (
    rd /s /q "%TMP_DIR%" 2>nul
    echo [OK] Cache temporal eliminado
) else (
    echo [INFO] No hay cache temporal
)

echo [INFO] Operacion completada
echo.
pause
goto :menu

REM ======================================================
REM 7. VERIFICAR CONFIGURACION
REM ======================================================
:check_config
cls
echo.
echo ========================================================
echo  VERIFICACION DE CONFIGURACION
echo ========================================================
echo.

if exist "%SCRIPT_DIR%keycloak-config.bat" (
    echo [OK] Archivo de configuracion encontrado
    echo.
    call "%SCRIPT_DIR%keycloak-config.bat"
    
    echo [INFO] Configuracion cargada:
    echo.
    echo  KEYCLOAK_ENV: %KEYCLOAK_ENV%
    echo  KEYCLOAK_VERSION: %KEYCLOAK_VERSION%
    echo  KEYCLOAK_HOME: %KEYCLOAK_HOME%
    echo  KEYCLOAK_PORT: %KEYCLOAK_PORT%
    echo  KEYCLOAK_ADMIN: %KEYCLOAK_ADMIN%
    echo  JAVA_HOME: %JAVA_HOME%
    echo.
    
    REM Validar rutas
    if exist "%KEYCLOAK_HOME%" (
        echo [OK] KEYCLOAK_HOME existe
    ) else (
        echo [ERROR] KEYCLOAK_HOME no existe
    )
    
    if exist "%JAVA_HOME%" (
        echo [OK] JAVA_HOME existe
    ) else (
        echo [ERROR] JAVA_HOME no existe
    )
) else (
    echo [ERROR] Archivo de configuracion NO encontrado
    echo [ERROR] Busca: %SCRIPT_DIR%keycloak-config.bat
)

echo.
pause
goto :menu

REM ======================================================
REM 8. TEST DE CONECTIVIDAD
REM ======================================================
:test_connectivity
cls
echo.
echo ========================================================
echo  TEST DE CONECTIVIDAD
echo ========================================================
echo.

if exist "%SCRIPT_DIR%keycloak-config.bat" (
    call "%SCRIPT_DIR%keycloak-config.bat"
)

if not defined KEYCLOAK_PORT (
    set "KEYCLOAK_PORT=8080"
)

echo [INFO] Probando conectividad a localhost:%KEYCLOAK_PORT%...
echo.

curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:%KEYCLOAK_PORT%/ 2>nul
if ERRORLEVEL 1 (
    echo [WARNING] curl no esta disponible o Keycloak no esta corriendo
    echo [INFO] Intenta acceder manualmente a:
    echo http://localhost:%KEYCLOAK_PORT%/
) else (
    echo [OK] Test completado
)

echo.
pause
goto :menu

REM ======================================================
REM SALIR
REM ======================================================
:end
echo.
echo [INFO] Saliendo...
endlocal
exit /b 0
