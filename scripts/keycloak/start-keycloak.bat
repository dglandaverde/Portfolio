@echo off
setlocal ENABLEDELAYEDEXPANSION
REM =====================================================
REM Keycloak Launcher - Enterprise Edition
REM =====================================================
REM Autor: Dennis Fuentes - DevOps Architect
REM Version: 2.0.0
REM Fecha: 2025-01-20
REM 
REM Caracteristicas:
REM - Validaciones robustas de entorno
REM - Soporte multi-ambiente (DEV/QA/PROD)
REM - Manejo de errores completo
REM - Configuracion externalizada
REM - Logging mejorado
REM - Deteccion automatica de conflictos
REM =====================================================

REM ---------- CONFIGURACION INICIAL ----------
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_NAME=%~nx0"
set "LOG_FILE=%SCRIPT_DIR%keycloak-launcher.log"

REM ---------- CARGAR CONFIGURACION ----------
if exist "%SCRIPT_DIR%keycloak-config.bat" (
    call "%SCRIPT_DIR%keycloak-config.bat"
) else (
    echo [ERROR] No se encuentra el archivo de configuracion: keycloak-config.bat
    echo [ERROR] Asegurate de que este en el mismo directorio que %SCRIPT_NAME%
    pause
    exit /b 99
)

REM ---------- BANNER ----------
cls
echo.
echo ========================================================
echo         KEYCLOAK LAUNCHER - ENTERPRISE EDITION
echo ========================================================
echo  Version: %KEYCLOAK_VERSION%
echo  Ambiente: %KEYCLOAK_ENV%
echo  Puerto: %KEYCLOAK_PORT%
echo  Script: %SCRIPT_NAME%
echo ========================================================
echo.

REM ======================================================
REM VALIDACIONES DE SEGURIDAD Y AMBIENTE
REM ======================================================

REM ---------- VALIDAR AMBIENTE ----------
if /I not "%KEYCLOAK_ENV%"=="DEV" (
    if /I not "%KEYCLOAK_ENV%"=="QA" (
        if /I not "%KEYCLOAK_ENV%"=="PROD" (
            echo [ERROR] Ambiente no valido: %KEYCLOAK_ENV%
            echo [ERROR] Ambientes permitidos: DEV, QA, PROD
            pause
            exit /b 20
        )
    )
)

REM ---------- ADVERTENCIA PARA PRODUCCION ----------
if /I "%KEYCLOAK_ENV%"=="PROD" (
    echo [WARNING] ========================================
    echo [WARNING] ESTAS INICIANDO KEYCLOAK EN MODO PRODUCCION
    echo [WARNING] NO SE RECOMIENDA USAR ESTE SCRIPT EN PROD
    echo [WARNING] USA DOCKER/KUBERNETES EN SU LUGAR
    echo [WARNING] ========================================
    echo.
    set /p "CONFIRM=Deseas continuar? (SI/NO): "
    if /I not "!CONFIRM!"=="SI" (
        echo [INFO] Operacion cancelada por el usuario.
        pause
        exit /b 21
    )
)

REM ---------- VALIDACION DE VARIABLES CRITICAS ----------
if "%KEYCLOAK_HOME%"=="" (
    echo [ERROR] La variable KEYCLOAK_HOME no esta definida en la configuracion.
    echo [ERROR] Edita keycloak-config.bat y configura la ruta correcta.
    pause
    exit /b 11
)

if "%KEYCLOAK_PORT%"=="" (
    echo [ERROR] La variable KEYCLOAK_PORT no esta definida en la configuracion.
    pause
    exit /b 10
)

if "%KEYCLOAK_ADMIN%"=="" (
    echo [ERROR] La variable KEYCLOAK_ADMIN no esta definida en la configuracion.
    pause
    exit /b 14
)

if "%KEYCLOAK_ADMIN_PASSWORD%"=="" (
    echo [ERROR] La variable KEYCLOAK_ADMIN_PASSWORD no esta definida en la configuracion.
    pause
    exit /b 15
)

REM ---------- VALIDAR CREDENCIALES DEBILES ----------
if /I "%KEYCLOAK_ENV%"=="PROD" (
    if /I "%KEYCLOAK_ADMIN_PASSWORD%"=="admin" (
        echo [ERROR] Contraseña de administrador insegura detectada en PRODUCCION.
        echo [ERROR] Cambia la contraseña en keycloak-config.bat
        pause
        exit /b 16
    )
)

REM Normalizar ruta (quitar comillas accidentales)
set "KEYCLOAK_HOME=%KEYCLOAK_HOME:"=%"

REM ---------- VALIDAR RUTAS DE INSTALACION ----------
if not exist "%KEYCLOAK_HOME%" (
    echo [ERROR] La carpeta de Keycloak no existe:
    echo [ERROR] %KEYCLOAK_HOME%
    echo.
    echo [SOLUCION] Verifica la ruta en keycloak-config.bat
    pause
    exit /b 12
)

if not exist "%KEYCLOAK_HOME%\bin\kc.bat" (
    echo [ERROR] No se encuentra el ejecutable de Keycloak:
    echo [ERROR] %KEYCLOAK_HOME%\bin\kc.bat
    echo.
    echo [SOLUCION] Verifica que KEYCLOAK_HOME apunte a la instalacion correcta.
    pause
    exit /b 13
)

REM ---------- VALIDAR JAVA ----------
where java >nul 2>&1
if ERRORLEVEL 1 (
    echo [ERROR] Java no esta instalado o no esta en el PATH.
    echo [ERROR] JAVA_HOME configurado: %JAVA_HOME%
    echo.
    echo [SOLUCION] Instala JDK 21+ o configura correctamente JAVA_HOME.
    pause
    exit /b 1
)

REM Obtener version de Java
set "JAVA_VER="
for /f "tokens=3" %%a in ('java -version 2^>^&1 ^| findstr "version"') do (
    set "JAVA_VER=%%a"
)
set "JAVA_VER=%JAVA_VER:"=%"

REM Extraer version major de Java
set "JAVA_MAJOR="
for /f "delims=. tokens=1" %%b in ("%JAVA_VER%") do set "JAVA_MAJOR=%%b"
set "JAVA_MAJOR=%JAVA_MAJOR: =%"

if "%JAVA_MAJOR%"=="" (
    echo [ERROR] No se puede detectar la version de Java instalada.
    echo [ERROR] Salida de java -version: %JAVA_VER%
    pause
    exit /b 2
)

REM Validar version minima de Java (21+ para Keycloak 26)
set /a IS_OK=%JAVA_MAJOR% - 21
if %IS_OK% LSS 0 (
    echo [ERROR] Keycloak 26 requiere JDK 21 o superior.
    echo [ERROR] Version detectada: Java %JAVA_VER%
    echo.
    echo [SOLUCION] Actualiza Java o configura JAVA_HOME a un JDK 21+
    pause
    exit /b 3
)

echo [OK] Java detectado: Version %JAVA_VER% (Mayor: %JAVA_MAJOR%)

REM ---------- VALIDAR PUERTO DISPONIBLE ----------
echo [INFO] Verificando disponibilidad del puerto %KEYCLOAK_PORT%...

set "PORT_PID="
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%KEYCLOAK_PORT%" ^| findstr "LISTENING"') do (
    set "PORT_PID=%%a"
    goto :port_found
)
:port_found

if defined PORT_PID (
    echo [ERROR] El puerto %KEYCLOAK_PORT% ya esta en uso.
    echo [ERROR] Proceso que lo esta usando: PID %PORT_PID%
    echo.
    echo [SOLUCION] Opciones:
    echo  1. Cierra la aplicacion con PID %PORT_PID%
    echo  2. Cambia KEYCLOAK_PORT en keycloak-config.bat
    echo  3. Usa: taskkill /PID %PORT_PID% /F (si es seguro)
    pause
    exit /b 4
) else (
    echo [OK] Puerto %KEYCLOAK_PORT% disponible
)

REM ======================================================
REM PREPARACION DEL ENTORNO
REM ======================================================

REM Establecer PATH con Java
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Aplicar opciones de JVM si estan configuradas
if defined JAVA_OPTS (
    echo [INFO] Aplicando JAVA_OPTS: %JAVA_OPTS%
)

REM ======================================================
REM ARRANQUE DE KEYCLOAK
REM ======================================================

echo.
echo ========================================================
echo  INICIANDO KEYCLOAK...
echo ========================================================
echo  URL de acceso: http://localhost:%KEYCLOAK_PORT%/
echo  Usuario Admin: %KEYCLOAK_ADMIN%
echo  Ambiente: %KEYCLOAK_ENV%
echo  Log Level: %KEYCLOAK_LOG_LEVEL%
echo ========================================================
echo.
echo [INFO] Presiona Ctrl+C para detener Keycloak
echo.

REM Cambiar al directorio bin de Keycloak
pushd "%KEYCLOAK_HOME%\bin" || (
    echo [ERROR] No se pudo cambiar al directorio: %KEYCLOAK_HOME%\bin
    pause
    exit /b 30
)

REM Construir comando de arranque
set "KC_CMD=kc.bat start-dev --http-port=%KEYCLOAK_PORT%"

REM Agregar parametros extra si existen
if defined KEYCLOAK_EXTRA_ARGS (
    set "KC_CMD=!KC_CMD! %KEYCLOAK_EXTRA_ARGS%"
)

REM Agregar nivel de log
if defined KEYCLOAK_LOG_LEVEL (
    set "KC_CMD=!KC_CMD! --log-level=%KEYCLOAK_LOG_LEVEL%"
)

echo [INFO] Comando de arranque:
echo [INFO] !KC_CMD!
echo.
echo [INFO] Iniciando... (esto puede tomar 30-60 segundos)
echo.

REM Ejecutar Keycloak
call !KC_CMD!

REM Capturar codigo de salida
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo ========================================================
echo  KEYCLOAK DETENIDO
echo ========================================================

if %EXIT_CODE% EQU 0 (
    echo [INFO] Keycloak se detuvo correctamente.
) else (
    echo [ERROR] Keycloak termino con codigo de error: %EXIT_CODE%
    echo [ERROR] Revisa los mensajes anteriores para mas detalles.
    echo.
    echo [AYUDA] Errores comunes:
    echo  - Puerto ya en uso
    echo  - Falta de permisos
    echo  - Configuracion invalida
    echo  - Base de datos no disponible
)

popd
endlocal

echo.
pause
exit /b %EXIT_CODE%
