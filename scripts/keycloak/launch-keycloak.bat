@echo off
setlocal ENABLEDELAYEDEXPANSION
REM =====================================================
REM Lanzador Keycloak (DEV) - Windows
REM - Probado con Keycloak 26.4.5 y Java 21 (Temurin)
REM - Valida Java, ruta de instalacion y puerto
REM - Ejecutar este .bat con doble clic o desde CMD
REM =====================================================

REM ---------- CONFIGURACION BASICA ----------
REM Version de Keycloak (solo informativo)
set "KEYCLOAK_VERSION=26.4.5"

REM Ruta base donde se tiene descomprimido Keycloak
set "KEYCLOAK_HOME=C:\Users\dgfuentes\Documents\keycloak-26.4.5"

REM Puerto HTTP donde levantara Keycloak
set "KEYCLOAK_PORT=8080"

REM Parametros extra opcionales para kc.bat
REM Ejemplo:
REM set "KEYCLOAK_EXTRA_ARGS=--hostname=localhost --hostname-strict=false"
set "KEYCLOAK_EXTRA_ARGS="

REM ---------- CONFIGURACION DE ADMINISTRADOR (DEV) ----------
REM ATENCION: Solo para ambiente local / desarrollo
set "KEYCLOAK_ADMIN=dgfuentes"
set "KEYCLOAK_ADMIN_PASSWORD=admin"

REM ---------- CONFIGURACION JAVA ----------
REM Forzar Java 21 (ruta al JDK que ya estas usando)
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM ---------- CONFIGURACION DB (OPCIONAL - EJEMPLO POSTGRES) ----------
REM Por defecto, start-dev usa H2 en memoria.
REM Si quieres una DB externa (p.ej. Postgres) descomenta y ajusta:
REM set "KC_DB=postgres"
REM set "KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak"
REM set "KC_DB_USERNAME=kc_user"
REM set "KC_DB_PASSWORD=kc_password"
REM set "KEYCLOAK_EXTRA_ARGS=%KEYCLOAK_EXTRA_ARGS% --db=%KC_DB% --db-url=%KC_DB_URL% --db-username=%KC_DB_USERNAME% --db-password=%KC_DB_PASSWORD%"

REM ======================================================
REM VALIDACIONES
REM ======================================================

echo.
echo ==========================================
echo [INFO] Lanzador Keycloak %KEYCLOAK_VERSION%
echo ==========================================
echo.

REM ---------- VALIDACION DE VARIABLES BASICAS ----------
if "%KEYCLOAK_HOME%"=="" (
    echo [ERROR] La variable KEYCLOAK_HOME no esta definida.
    pause
    exit /b 11
)

if "%KEYCLOAK_PORT%"=="" (
    echo [ERROR] La variable KEYCLOAK_PORT no esta definida.
    pause
    exit /b 10
)

REM Normalizar ruta (quitar comillas accidentales)
set "KEYCLOAK_HOME=%KEYCLOAK_HOME:"=%"

if not exist "%KEYCLOAK_HOME%" (
    echo [ERROR] La carpeta "%KEYCLOAK_HOME%" no existe.
    echo Verifica la ruta de instalacion de Keycloak.
    pause
    exit /b 12
)

if not exist "%KEYCLOAK_HOME%\bin\kc.bat" (
    echo [ERROR] No se encuentra "%KEYCLOAK_HOME%\bin\kc.bat".
    echo Verifica que KEYCLOAK_HOME apunte a la carpeta correcta de Keycloak.
    pause
    exit /b 13
)

REM ---------- VALIDAR JAVA INSTALADO ----------
where java >nul 2>&1
if ERRORLEVEL 1 (
    echo [ERROR] Java no esta instalado o no esta en el PATH.
    echo Instala JDK 21+ o configura JAVA_HOME y PATH.
    pause
    exit /b 1
)

REM Obtener version de Java
set "JAVA_VER="
for /f "tokens=3" %%a in ('java -version 2^>^&1 ^| findstr "version"') do (
    set "JAVA_VER=%%a"
)
set "JAVA_VER=%JAVA_VER:"=%"

set "JAVA_MAJOR="
for /f "delims=. tokens=1" %%b in ("%JAVA_VER%") do set "JAVA_MAJOR=%%b"
set "JAVA_MAJOR=%JAVA_MAJOR: =%"

if "%JAVA_MAJOR%"=="" (
    echo [ERROR] No se puede detectar la version de Java instalada.
    echo Salida de java -version: %JAVA_VER%
    pause
    exit /b 2
)

REM Para Keycloak 26, lo recomendable es Java 21+
set /a IS_OK=%JAVA_MAJOR% - 21
if %IS_OK% LSS 0 (
    echo [ERROR] Keycloak 26 recomienda JDK 21 o superior. Detectado: %JAVA_VER%
    pause
    exit /b 3
)

echo [INFO] Version de Java detectada: %JAVA_VER%

REM ---------- VALIDAR PUERTO OCUPADO ----------
set "PORT_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%KEYCLOAK_PORT%" ^| findstr "LISTENING"') do (
    set "PORT_PID=%%a"
)

if defined PORT_PID (
    echo [ERROR] El puerto %KEYCLOAK_PORT% ya esta en uso por el proceso PID %PORT_PID%.
    echo Cierra la aplicacion que lo esta usando o cambia KEYCLOAK_PORT.
    pause
    exit /b 4
)

REM ======================================================
REM ARRANQUE DE KEYCLOAK
REM ======================================================

pushd "%KEYCLOAK_HOME%\bin"

echo.
echo ==========================================
echo [INFO] Keycloak va a iniciar en:
echo http://localhost:%KEYCLOAK_PORT%/
echo [INFO] Usuario Administrador (DEV): %KEYCLOAK_ADMIN%
echo [INFO] Para detener Keycloak, presiona Ctrl+C
echo ==========================================
echo.

REM Comando de arranque (modo DEV)
set "KC_CMD=kc.bat start-dev --http-port=%KEYCLOAK_PORT% %KEYCLOAK_EXTRA_ARGS%"

echo [INFO] Ejecutando: %KC_CMD%
echo.

%KC_CMD%

echo.
echo [INFO] Keycloak se ha detenido (o fallo el arranque).
echo [INFO] Revisa los mensajes anteriores para mas detalle.
echo.

popd
endlocal
pause
exit /b 0
