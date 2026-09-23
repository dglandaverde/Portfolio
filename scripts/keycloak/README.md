# Keycloak Launcher - Enterprise Edition

Scripts profesionales para lanzar Keycloak en Windows con validaciones robustas y soporte multi-ambiente.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Ambientes](#ambientes)
- [Solución de Problemas](#solución-de-problemas)
- [Mejores Prácticas](#mejores-prácticas)

---

## ✨ Características

### Script Original vs Mejorado

| Aspecto | Script Original | Script Mejorado |
|---------|----------------|-----------------|
| **Sintaxis** | ❌ Comandos incorrectos (establecer, establezca) | ✅ Sintaxis correcta (set) |
| **Estructura** | ❌ Todo en un archivo | ✅ Configuración separada |
| **Validaciones** | ⚠️ Básicas | ✅ Completas y robustas |
| **Ambientes** | ❌ Solo DEV | ✅ DEV, QA, PROD |
| **Mensajes** | ⚠️ Mezcla de español/inglés | ✅ Consistente en español |
| **Manejo de Errores** | ⚠️ Básico | ✅ Códigos de error descriptivos |
| **Seguridad** | ❌ Sin validaciones | ✅ Validación de credenciales |
| **Logs** | ❌ No estructurados | ✅ Logs claros y organizados |

### Características Enterprise

✅ **Validaciones Completas**
- Java 21+ requerido
- Puerto disponible
- Rutas de instalación
- Credenciales seguras

✅ **Soporte Multi-Ambiente**
- DEV (Desarrollo)
- QA (Quality Assurance)
- PROD (Producción con advertencias)

✅ **Manejo de Errores Robusto**
- Códigos de error únicos
- Mensajes descriptivos
- Soluciones sugeridas

✅ **Configuración Externalizada**
- Archivo separado de configuración
- Fácil mantenimiento
- Versionable

✅ **Logs y Monitoreo**
- Nivel de log configurable
- Salida estructurada
- Tracking de errores

---

## 🔧 Requisitos

### Software Necesario

1. **Windows 10/11** o Windows Server 2019+
2. **Java JDK 21+** (Recomendado: Eclipse Temurin)
   - Descargar: https://adoptium.net/
3. **Keycloak 26.4.5** (o superior)
   - Descargar: https://www.keycloak.org/downloads
4. **(Opcional) PostgreSQL 15+** para ambientes QA/PROD

### Verificar Instalaciones

```cmd
REM Verificar Java
java -version

REM Verificar PATH de Java
echo %JAVA_HOME%

REM Verificar puerto disponible
netstat -ano | findstr ":8080"
```

---

## 📦 Instalación

### Paso 1: Descargar Scripts

Clona el repositorio o descarga los scripts:

```cmd
git clone https://github.com/dennislandaverde/Portfolio.git
cd Portfolio\scripts\keycloak
```

### Paso 2: Estructura de Archivos

```
scripts/
└── keycloak/
    ├── start-keycloak.bat      (Script principal - ENTERPRISE)
    ├── launch-keycloak.bat     (Script corregido - BASIC)
    ├── keycloak-config.bat     (Configuración)
    └── README.md               (Esta documentación)
```

### Paso 3: Configurar Keycloak

1. Descarga Keycloak 26.4.5
2. Descomprime en una ubicación conocida
   - Ejemplo: `C:\Users\dgfuentes\Documents\keycloak-26.4.5`
3. Anota la ruta completa

---

## ⚙️ Configuración

### Editar `keycloak-config.bat`

Abre el archivo y configura según tu ambiente:

```batch
REM === AMBIENTE DE DESARROLLO ===
if /I "%KEYCLOAK_ENV%"=="DEV" (
    set "KEYCLOAK_HOME=C:\Users\TU_USUARIO\Documents\keycloak-26.4.5"
    set "KEYCLOAK_PORT=8080"
    set "KEYCLOAK_ADMIN=admin"
    set "KEYCLOAK_ADMIN_PASSWORD=admin"
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
)
```

### Variables Principales

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `KEYCLOAK_HOME` | Ruta de instalación de Keycloak | `C:\keycloak\keycloak-26.4.5` |
| `KEYCLOAK_PORT` | Puerto HTTP | `8080` |
| `KEYCLOAK_ADMIN` | Usuario administrador | `admin` |
| `KEYCLOAK_ADMIN_PASSWORD` | Contraseña admin | `admin` (cambiar en prod) |
| `JAVA_HOME` | Ruta del JDK | `C:\Program Files\...jdk-21` |

---

## 🚀 Uso

### Opción 1: Doble Click (Recomendado para DEV)

1. Doble click en `start-keycloak.bat`
2. Espera que inicie (30-60 segundos)
3. Accede a: http://localhost:8080/

### Opción 2: Línea de Comandos

```cmd
REM Iniciar en ambiente DEV (por defecto)
start-keycloak.bat

REM Iniciar en ambiente específico
set KEYCLOAK_ENV=QA
start-keycloak.bat
```

### Detener Keycloak

- Presiona `Ctrl+C` en la ventana del script
- O cierra la ventana de comando

---

## 🌍 Ambientes

### DEV (Desarrollo)

**Características:**
- H2 en memoria (base de datos)
- Credenciales simples
- Puerto 8080
- Sin SSL

**Uso:**
```cmd
set KEYCLOAK_ENV=DEV
start-keycloak.bat
```

### QA (Quality Assurance)

**Características:**
- PostgreSQL externo
- Puerto 8081
- Credenciales más seguras
- Configuración cercana a producción

**Requisitos adicionales:**
- PostgreSQL instalado y corriendo
- Base de datos `keycloak_qa` creada

**Uso:**
```cmd
set KEYCLOAK_ENV=QA
start-keycloak.bat
```

### PROD (Producción)

⚠️ **NO RECOMENDADO USAR ESTE SCRIPT EN PRODUCCIÓN**

Para producción, usa:
- Docker / Docker Compose
- Kubernetes
- Openshift

El script muestra advertencias y requiere confirmación explícita.

---

## 🔍 Solución de Problemas

### Error: "Java no esta instalado o no esta en el PATH"

**Solución:**
1. Instala JDK 21+: https://adoptium.net/
2. Configura `JAVA_HOME` en `keycloak-config.bat`
3. Verifica: `java -version`

### Error: "El puerto 8080 ya esta en uso"

**Solución Opción 1 - Cambiar Puerto:**
```batch
REM En keycloak-config.bat
set "KEYCLOAK_PORT=8081"
```

**Solución Opción 2 - Liberar Puerto:**
```cmd
REM Ver qué proceso usa el puerto
netstat -ano | findstr ":8080"

REM Matar el proceso (reemplaza PID con el número real)
taskkill /PID 1234 /F
```

### Error: "Keycloak 26 requiere JDK 21 o superior"

**Solución:**
1. Actualiza Java a versión 21+
2. Actualiza `JAVA_HOME` en `keycloak-config.bat`

### Error: "La carpeta de Keycloak no existe"

**Solución:**
1. Verifica que Keycloak esté descomprimido
2. Actualiza `KEYCLOAK_HOME` en `keycloak-config.bat` con la ruta correcta

### Keycloak no inicia (sin error específico)

**Revisar:**
1. Logs en `%KEYCLOAK_HOME%\data\log\`
2. Permisos de escritura en carpeta de Keycloak
3. Firewall o antivirus bloqueando

---

## 🏆 Mejores Prácticas

### Seguridad

#### ✅ Hacer
- Cambiar contraseñas por defecto en QA/PROD
- Usar credenciales diferentes por ambiente
- Mantener las credenciales fuera del control de versiones
- Usar PostgreSQL/Oracle en ambientes no-dev

#### ❌ Evitar
- Usar credenciales de producción en desarrollo
- Exponer puertos de Keycloak a internet sin SSL
- Usar H2 en memoria en producción
- Compartir credenciales entre ambientes

### Performance

```batch
REM En keycloak-config.bat - Configurar memoria JVM
set "JAVA_OPTS=-Xms512m -Xmx2048m"
```

### Base de Datos Externa (PostgreSQL)

#### Crear Base de Datos:

```sql
-- En PostgreSQL
CREATE DATABASE keycloak_dev;
CREATE USER kc_user WITH PASSWORD 'kc_password';
GRANT ALL PRIVILEGES ON DATABASE keycloak_dev TO kc_user;
```

#### Configurar en `keycloak-config.bat`:

```batch
set "KC_DB=postgres"
set "KC_DB_URL=jdbc:postgresql://localhost:5432/keycloak_dev"
set "KC_DB_USERNAME=kc_user"
set "KC_DB_PASSWORD=kc_password"
set "KEYCLOAK_EXTRA_ARGS=--db=%KC_DB% --db-url=%KC_DB_URL% --db-username=%KC_DB_USERNAME% --db-password=%KC_DB_PASSWORD%"
```

---

## 📊 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 0 | Éxito |
| 1 | Java no instalado o no en PATH |
| 2 | No se puede detectar versión de Java |
| 3 | Versión de Java insuficiente (< 21) |
| 4 | Puerto ya en uso |
| 10 | KEYCLOAK_PORT no definido |
| 11 | KEYCLOAK_HOME no definido |
| 12 | KEYCLOAK_HOME no existe |
| 13 | kc.bat no encontrado |
| 14 | KEYCLOAK_ADMIN no definido |
| 15 | KEYCLOAK_ADMIN_PASSWORD no definido |
| 16 | Contraseña insegura en PROD |
| 20 | Ambiente inválido |
| 21 | Operación cancelada por usuario |
| 30 | Error al cambiar directorio |
| 99 | Archivo de configuración no encontrado |

---

## 📝 Comparativa de Scripts

### 1. `launch-keycloak.bat` - Versión Básica Corregida

**Uso:** Rápido inicio para desarrollo
**Características:**
- Sintaxis corregida
- Validaciones básicas
- Configuración inline

### 2. `start-keycloak.bat` - Versión Enterprise

**Uso:** Ambientes corporativos
**Características:**
- Configuración externalizada
- Multi-ambiente
- Validaciones robustas
- Manejo de errores completo
- Logs estructurados

---

## 🤝 Contribuir

Si encuentras problemas o tienes sugerencias:

1. Reporta issues en GitHub
2. Propón mejoras vía Pull Request
3. Documenta cambios realizados

---

## 👨‍💻 Autor

**Dennis Fuentes**
- Rol: DevOps Enterprise Architect
- Stack: Angular 15+, Java 21, Quarkus 3.x, Keycloak, Docker

---

## 📄 Licencia

Este proyecto es parte del portfolio personal y está disponible para uso educativo y referencia.

---

## 🔗 Enlaces Útiles

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Downloads](https://www.keycloak.org/downloads)
- [Eclipse Adoptium (Java)](https://adoptium.net/)
- [PostgreSQL Downloads](https://www.postgresql.org/download/)

---

## 📅 Historial de Versiones

### v2.0.0 (2025-01-20) - Enterprise Edition
- ✅ Configuración externalizada
- ✅ Soporte multi-ambiente
- ✅ Validaciones completas
- ✅ Manejo de errores robusto
- ✅ Documentación completa

### v1.0.0 (Original)
- ✅ Script básico corregido
- ✅ Sintaxis Windows Batch válida
- ✅ Validaciones esenciales

---

**¿Preguntas? ¿Problemas?**

Revisa la sección de [Solución de Problemas](#solución-de-problemas) o abre un issue en GitHub.
