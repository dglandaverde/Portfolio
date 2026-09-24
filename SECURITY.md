# Seguridad

Este documento describe cómo se manejan los secretos y qué defensas tiene el
sitio. Está pensado para quien mantenga el proyecto, no para el visitante.

---

## ⚠️ Acción pendiente: rotar las credenciales de EmailJS

La versión anterior del portafolio tenía estas credenciales **escritas en el
código fuente y subidas al repositorio público**:

| Credencial | Valor expuesto | Ubicación |
| --- | --- | --- |
| EmailJS `publicKey` | `K64adrKEjSfiP2FDz` | `JS/main.js` |
| EmailJS `serviceID` | `service_k8pryh5` | `JS/main.js` |
| EmailJS `templateID` | `template_er0wv3l` | `JS/main.js` |

Esos valores **siguen en el historial de git** aunque el fichero ya no exista.
Borrar el fichero no borra el historial.

**Qué hacer:**

1. Entra en <https://dashboard.emailjs.com> y **revoca o regenera** la clave
   pública, el servicio y la plantilla.
2. Si no vas a seguir usando EmailJS, elimina la cuenta o el servicio: una
   credencial que ya no sirve no se puede abusar.
3. Opcionalmente, purga el historial con
   [`git-filter-repo`](https://github.com/newren/git-filter-repo). Reescribe el
   historial, así que coordínalo si alguien más ha clonado el repositorio.

> La `publicKey` de EmailJS es pública por diseño — está pensada para vivir en
> el navegador. Aun así conviene rotarla: cualquiera con esos tres valores
> podía enviar correos a través de tu cuenta y agotar tu cuota.

---

## Cómo se protegen las variables de entorno

### La regla

```
NEXT_PUBLIC_ALGO   →  se incrusta en el bundle del navegador   →  PÚBLICO
ALGO               →  sólo existe en el proceso de servidor    →  SECRETO
```

No hay un punto intermedio. Poner `NEXT_PUBLIC_` delante de una API key la
publica, aunque el nombre diga «secret».

### Las tres barreras

**1. Separación física de los módulos**

| Módulo | Importa `server-only` | Contenido |
| --- | --- | --- |
| `src/lib/env/server.ts` | ✅ sí | `RESEND_API_KEY`, correos, límites |
| `src/lib/env/public.ts` | ❌ no | sólo `NEXT_PUBLIC_SITE_URL` |

El paquete `server-only` no hace nada en tiempo de ejecución: **rompe el
build** si un Client Component importa ese módulo. No es una convención que
se pueda olvidar, es un error de compilación.

**2. Validación con esquema**

Ambos módulos validan con Zod al cargarse. Si falta `RESEND_API_KEY`, o no
empieza por `re_`, o `CONTACT_TO_EMAIL` no es un correo válido, el proceso
lanza con un mensaje que dice **qué** falta — nunca el valor. Un log no debe
filtrar un secreto.

**3. `.gitignore` con lista blanca**

```gitignore
.env
.env.*
!.env.example    # única excepción
```

Se ignora todo y se permite explícitamente la plantilla. Lo contrario
—enumerar los ficheros a ignorar— falla en cuanto alguien crea
`.env.produccion`.

### Verificar que no se filtra nada

```bash
npm run build
grep -r "RESEND_API_KEY\|re_" .next/static/    # no debe devolver nada
```

Este proyecto se verificó así: ninguna variable de servidor aparece en el
bundle del cliente ni en el HTML servido.

### Configurarlas en Vercel

```bash
vercel env add RESEND_API_KEY production
vercel env add CONTACT_FROM_EMAIL production
vercel env add CONTACT_TO_EMAIL production
vercel env add NEXT_PUBLIC_SITE_URL production
```

O desde el panel: **Project → Settings → Environment Variables**. Marca las
tres primeras como *Sensitive* para que ni siquiera se puedan volver a leer
desde la interfaz.

---

## Defensas del formulario de contacto

El formulario es la única superficie del sitio que acepta entrada de terceros.
`POST /api/contact` aplica, en este orden:

| # | Control | Qué evita |
| --- | --- | --- |
| 1 | Validación de configuración | Responde `503` sin revelar qué variable falta |
| 2 | Rate limit por IP (5 / 10 min) | Inundación de envíos |
| 3 | Límite de tamaño del cuerpo (16 KB) | Payloads desproporcionados |
| 4 | Parseo defensivo de JSON | Cuelgue por cuerpo malformado |
| 5 | Esquema Zod | Datos fuera de rango o de tipo incorrecto |
| 6 | Honeypot | Spam automatizado, sin CAPTCHA |
| 7 | Escapado de HTML | Inyección de marcado en el correo recibido |
| 8 | Errores genéricos | Filtración de detalles del proveedor o del stack |

**Sobre el honeypot:** cuando se detecta, la respuesta es `200 success`. Es
intencionado. Un bot que recibe un error sabe que fue detectado y reintenta
con otra táctica; uno que recibe éxito se marcha satisfecho.

**Sobre el rate limit:** es en memoria. En serverless cada instancia tiene su
propio contador, así que el límite efectivo es «5 por instancia», no «5
global». Para un portafolio basta. Si el tráfico crece, sustituye
`src/lib/rate-limit.ts` por Upstash Redis o Vercel KV manteniendo la misma
firma de `checkRateLimit()`.

---

## Cabeceras HTTP

Definidas en `next.config.ts` y aplicadas a todas las rutas:

| Cabecera | Valor | Para qué |
| --- | --- | --- |
| `Content-Security-Policy` | ver abajo | Limita de dónde se puede cargar cada recurso |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Fuerza HTTPS durante 2 años |
| `X-Content-Type-Options` | `nosniff` | Impide que el navegador adivine el MIME type |
| `X-Frame-Options` | `DENY` | Bloquea clickjacking en navegadores antiguos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No filtra la ruta completa a terceros |
| `Permissions-Policy` | cámara, micrófono, ubicación y *topics* revocados | Reduce la superficie de APIs del navegador |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla el contexto de navegación |

`X-Powered-By` está desactivado: no hace falta anunciar la versión del
framework.

### La CSP y su compromiso

En **producción**:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
manifest-src 'self'; upgrade-insecure-requests
```

### Diferencias en desarrollo

`next dev` necesita cosas que producción no, así que `next.config.ts` ajusta
las cabeceras según `NODE_ENV`. Lo que se relaja **sólo** en desarrollo:

| Directiva | En dev | Por qué |
| --- | --- | --- |
| `'unsafe-eval'` en `script-src` | añadida | React usa `eval()` en modo desarrollo para reconstruir pilas de llamadas y otras ayudas de depuración. **En producción React nunca lo usa**, así que ahí queda prohibido. |
| `ws:` `wss:` en `connect-src` | añadidas | El recargado en caliente (HMR) abre un WebSocket contra el host local. |
| `upgrade-insecure-requests` | **omitida** | En local se sirve por http; esa directiva intentaría ascender las peticiones a https y rompería el servidor de desarrollo. |
| `Strict-Transport-Security` | **omitida** | Ésta importa: si el navegador recibiera HSTS desde `localhost`, recordaría durante dos años que localhost va por https y **rompería el arranque de cualquier otro proyecto local**, no sólo de éste. Revertirlo obliga a limpiar el estado HSTS del navegador a mano. |

Para comprobar qué se está enviando en cada entorno:

```bash
npm run dev    &&  curl -sI http://localhost:3000/es | grep -i "content-security\|strict-transport"
npm run build  &&  npm start
                   curl -sI http://localhost:3000/es | grep -i "content-security\|strict-transport"
```

En producción no debe aparecer `unsafe-eval` ni `ws:`, y sí
`upgrade-insecure-requests` y `Strict-Transport-Security`.

`script-src` incluye `'unsafe-inline'`, necesario para el script de arranque
de Next. La alternativa —CSP con *nonce*— obliga a renderizar cada petición
en el servidor y renuncia a la generación estática y al caché de CDN.

**Se eligió lo estático** porque el sitio no carga ningún script de terceros
ni muestra contenido enviado por usuarios: la superficie real de XSS es nula.

Si algún día se añade contenido dinámico de terceros, migrar a nonce:

1. Generar un nonce por petición en `src/proxy.ts`.
2. Reenviarlo en la cabecera `Content-Security-Policy`.
3. Leer `headers()` en `src/app/[locale]/layout.tsx` (esto vuelve la ruta
   dinámica, que es precisamente el coste).

---

## Qué NO se publica

- **El correo personal.** No aparece en el JSON-LD ni en ninguna parte del
  HTML: sería alimento directo para rastreadores de spam. El canal público es
  el formulario; la dirección real vive en `CONTACT_TO_EMAIL`, en el servidor.
- **Detalles de error.** El límite de error muestra un `digest` con el que
  correlacionar contra el log del servidor, nunca el stack.
- **Ningún script de terceros.** Sin analíticas, sin CDN de fuentes, sin
  Font Awesome. Todo se sirve desde el propio dominio.

---

## Reportar una vulnerabilidad

Abre un *issue* en el repositorio o escribe por
[LinkedIn](https://www.linkedin.com/in/dennislandaverde/). No publiques
detalles explotables en un issue público.
