# Keycloak Launcher - Guía Rápida 🚀

## Para empezar en 5 minutos

### ✅ Pre-requisitos
- Windows 10/11
- Java 21+ instalado
- Keycloak 26.4.5 descargado y descomprimido

---

## 🎯 Paso 1: Editar Configuración

Abre `keycloak-config.bat` y actualiza estas 2 líneas:

```batch
set "KEYCLOAK_HOME=C:\TU_RUTA\keycloak-26.4.5"
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
```

💡 **Tip**: Copia la ruta completa desde el explorador de Windows.

---

## 🎯 Paso 2: Ejecutar

**Opción Simple:**
```
Doble click en: start-keycloak.bat
```

**Opción Línea de Comandos:**
```cmd
start-keycloak.bat
```

---

## 🎯 Paso 3: Acceder

Espera 30-60 segundos y abre tu navegador:

```
http://localhost:8080/
```

**Credenciales:**
- Usuario: `dgfuentes` (o el que configuraste)
- Contraseña: `admin` (o la que configuraste)

---

## ❌ ¿Problemas?

### Java no encontrado
```cmd
REM Verifica la instalación
java -version

REM Si falla, instala Java 21+ desde:
REM https://adoptium.net/
```

### Puerto ocupado
```cmd
REM Opción 1: Cambia el puerto en keycloak-config.bat
set "KEYCLOAK_PORT=8081"

REM Opción 2: Ver qué proceso lo usa
netstat -ano | findstr ":8080"
```

### Ruta incorrecta
```
[ERROR] La carpeta de Keycloak no existe
```

**Solución**: Verifica que `KEYCLOAK_HOME` en `keycloak-config.bat` sea la ruta correcta.

---

## 🛠️ Herramientas Útiles

Ejecuta `keycloak-utils.bat` para:
- ✅ Verificar requisitos
- ✅ Liberar puertos
- ✅ Ver logs
- ✅ Diagnosticar problemas

---

## 📚 Más Información

Lee el [README.md](README.md) completo para:
- Configuración avanzada
- Múltiples ambientes (DEV/QA/PROD)
- Base de datos externa
- Troubleshooting detallado

---

## 🤝 ¿Necesitas ayuda?

1. Ejecuta `keycloak-utils.bat` → Opción 1 (Verificar Requisitos)
2. Lee la sección de [Solución de Problemas](README.md#solución-de-problemas)
3. Abre un issue en GitHub

---

**¡Listo! En 5 minutos deberías tener Keycloak corriendo** 🎉
