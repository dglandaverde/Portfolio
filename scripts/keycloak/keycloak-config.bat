@echo off
REM =====================================================
REM Archivo de Configuracion - Keycloak Launcher
REM - Separar configuracion del script principal
REM - Facilita mantenimiento y versionado
REM =====================================================

REM ---------- CONFIGURACION DE AMBIENTE ----------
REM Opciones: DEV, QA, PROD (por defecto: DEV)
if "%KEYCLOAK_ENV%"=="" set "KEYCLOAK_ENV=DEV"

REM ---------- CONFIGURACION GENERAL ----------
set "KEYCLOAK_VERSION=26.4.5"

REM ---------- CONFIGURACION POR AMBIENTE ----------

if /I "%KEYCLOAK_ENV%"=="DEV" (
    REM === AMBIENTE DE DESARROLLO ===
    set "KEYCLOAK_HOME=C:\Users\dgfuentes\Documents\keycloak-26.4.5"
    set "KEYCLOAK_PORT=8080"
    set "KEYCLOAK_ADMIN=dgfuentes"
    set "KEYCLOAK_ADMIN_PASSWORD=admin"
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
    
    REM Parametros adicionales para desarrollo
    set "KEYCLOAK_EXTRA_ARGS=--hostname=localhost --hostname-strict=false"
    
    REM Base de datos (H2 en memoria por defecto en DEV)
    REM set "KC_DB=h2-mem"
)

if /I "%KEYCLOAK_ENV%"=="QA" (
    REM === AMBIENTE DE QA ===
    set "KEYCLOAK_HOME=C:\keycloak\qa\keycloak-26.4.5"
    set "KEYCLOAK_PORT=8081"
    set "KEYCLOAK_ADMIN=admin_qa"
    set "KEYCLOAK_ADMIN_PASSWORD=ChangeMe_QA"
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
    
    REM Configuracion de base de datos externa para QA
    set "KC_DB=postgres"
    set "KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak_qa"
    set "KC_DB_USERNAME=kc_user_qa"
    set "KC_DB_PASSWORD=kc_pass_qa"
    set "KEYCLOAK_EXTRA_ARGS=--db=%KC_DB% --db-url=%KC_DB_URL% --db-username=%KC_DB_USERNAME% --db-password=%KC_DB_PASSWORD%"
)

if /I "%KEYCLOAK_ENV%"=="PROD" (
    REM === AMBIENTE DE PRODUCCION ===
    echo [WARNING] Configuracion de PRODUCCION no recomendada en script local.
    echo [WARNING] Use Docker/Kubernetes para ambientes productivos.
    set "KEYCLOAK_HOME=C:\keycloak\prod\keycloak-26.4.5"
    set "KEYCLOAK_PORT=8443"
    set "KEYCLOAK_ADMIN=admin_prod"
    set "KEYCLOAK_ADMIN_PASSWORD=ChangeMe_PROD"
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
    
    REM Configuracion de base de datos externa para PROD
    set "KC_DB=postgres"
    set "KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak_prod"
    set "KC_DB_USERNAME=kc_user_prod"
    set "KC_DB_PASSWORD=kc_pass_prod"
    set "KEYCLOAK_EXTRA_ARGS=--db=%KC_DB% --db-url=%KC_DB_URL% --db-username=%KC_DB_USERNAME% --db-password=%KC_DB_PASSWORD%"
)

REM ---------- CONFIGURACION DE LOGGING ----------
REM Nivel de log: ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF
set "KEYCLOAK_LOG_LEVEL=INFO"

REM ---------- CONFIGURACION DE PERFORMANCE ----------
REM Opciones de memoria JVM (opcional)
REM set "JAVA_OPTS=-Xms512m -Xmx2048m"

exit /b 0
