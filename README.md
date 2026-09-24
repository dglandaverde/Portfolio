# Portafolio · Dennis Landaverde

Portafolio personal bilingüe (ES/EN) construido con Next.js 16, React 19 y
TypeScript en modo estricto.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## Puesta en marcha

```bash
git clone https://github.com/dglandaverde/Portfolio.git
cd Portfolio
npm install

cp .env.example .env.local    # y completa los valores
npm run dev                   # http://localhost:3000
```

Requiere **Node.js 20.9 o superior**.

El sitio arranca sin configurar nada: sólo el formulario de contacto necesita
credenciales. Sin ellas responde `503` y muestra un mensaje al visitante en
lugar de romperse.

---

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run typecheck` | Comprueba tipos sin emitir |
| `npm run lint` | ESLint |
| `npm run format` | Formatea con Prettier |
| `npm run check` | **typecheck + lint + format** — lo que se ejecuta en CI |

---

## Variables de entorno

Copia `.env.example` a `.env.local`. **`.env.local` nunca se sube al
repositorio**; el `.gitignore` ignora todo `.env*` y permite sólo la
plantilla.

| Variable | Ámbito | Obligatoria | Para qué |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | 🔒 servidor | sí¹ | Enviar el correo del formulario |
| `CONTACT_FROM_EMAIL` | 🔒 servidor | sí¹ | Remitente verificado en Resend |
| `CONTACT_TO_EMAIL` | 🔒 servidor | sí¹ | Buzón que recibe los mensajes |
| `RATE_LIMIT_MAX_REQUESTS` | 🔒 servidor | no (5) | Envíos por IP y ventana |
| `RATE_LIMIT_WINDOW_SECONDS` | 🔒 servidor | no (600) | Duración de la ventana |
| `NEXT_PUBLIC_SITE_URL` | 🌐 público | recomendada | Canonical, sitemap, Open Graph |

¹ Sólo si quieres que el formulario funcione.

> **🔒 servidor** = nunca sale del proceso de servidor.
> **🌐 público** = se incrusta en el bundle del navegador; jamás un secreto.
>
> Detalles completos, verificación y rotación de credenciales en
> **[SECURITY.md](SECURITY.md)**.

---

## Arquitectura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          <html>, fuentes, metadata SEO, JSON-LD
│   │   ├── page.tsx            composición de la página
│   │   ├── error.tsx           límite de error traducido
│   │   ├── not-found.tsx       404 con idioma
│   │   └── opengraph-image.tsx imagen OG generada por idioma
│   ├── api/contact/route.ts    endpoint del formulario (servidor)
│   ├── apple-icon.tsx          icono de iOS generado en build
│   ├── robots.ts · sitemap.ts  SEO
│   └── globals.css             tokens de diseño y capa base
│
├── components/
│   ├── layout/                 cabecera, pie, selector de idioma y tema
│   ├── sections/               hero, sobre mí, habilidades, servicios…
│   ├── ui/                     primitivos reutilizables
│   └── icons/                  SVG de marca inline (generados, sin CDN)
│
├── content/site.ts             datos estructurales tipados
├── i18n/                       enrutado, navegación y carga de mensajes
├── lib/
│   ├── env/server.ts           🔒 secretos validados (con `server-only`)
│   ├── env/public.ts           🌐 variables públicas validadas
│   ├── contact-schema.ts       esquema compartido cliente ↔ servidor
│   ├── rate-limit.ts           ventana deslizante en memoria
│   ├── theme.ts                lectura y persistencia del tema
│   ├── scroll.ts               sección activa y compensación de cabecera
│   └── hooks/                  hooks de cliente
│
├── messages/{es,en}.json       traducciones
└── proxy.ts                    detección y redirección de idioma
```

### Decisiones y por qué

**Todo estático salvo la API.** Las páginas se generan en build y se sirven
desde CDN. `setRequestLocale()` en el layout es lo que lo hace posible con
next-intl. El único punto dinámico es `/api/contact`, que es donde debe estar.

**Contenido separado de traducción.** `src/content/site.ts` guarda
identificadores, enlaces y metadatos; `src/messages/*.json` guarda el texto.
Añadir un proyecto es tocar un array; traducirlo es tocar dos JSON.

**Un solo esquema de validación.** `contact-schema.ts` lo usan el navegador y
el servidor. Imposible que diverjan. La validación del cliente ahorra un viaje
de red; la del servidor es la que manda.

**Animaciones sin JavaScript.** La entrada al hacer scroll usa
`animation-timeline: view()`, dentro de `@supports`. Si el navegador no lo
soporta, el contenido simplemente aparece. Nunca depende de JavaScript para
ser visible — ni para el visitante, ni para un rastreador.

**Iconos inline.** Font Awesome se cargaba desde una CDN: ~30 KB de CSS, una
petición bloqueante y una dependencia externa en la CSP. Ahora los SVG están
generados en `src/components/icons/` y sólo viaja lo que se usa. Oracle
Database y JD Edwards no tienen logo público —Oracle retiró sus marcas de
Simple Icons—, así que usan dos iconos geométricos propios, de relleno como
el resto para que no desentonen. Java usa el logo de OpenJDK, que es la misma
taza de café sin el problema de marca.

**El tema vive en `data-theme`, no en una clase.** React controla `className`
de `<html>` y, al remontar el layout raíz —lo que ocurre al cambiar de
idioma, porque cambia el segmento `[locale]`—, vacía todos los atributos del
elemento y sólo repone los que él renderiza. Una clase puesta por fuera se
perdía; un atributo que React desconoce, no. `<ThemeSync />` lo repone además
en cada renderizado, con `useLayoutEffect`, es decir antes del pintado.

**Una sola definición de «sección actual».** `getCurrentSectionId()` en
`src/lib/scroll.ts` la usan tanto el resaltado del menú como el cambio de
idioma. Cuando cada uno tenía su propio criterio, el menú marcaba una sección
y el cambio de idioma te dejaba en otra.

**La compensación de la cabecera fija está en un solo sitio:**
`scroll-padding-top` en `<html>`. Ningún elemento lleva `scroll-mt`; tener
ambos duplicaba el hueco y hundía los títulos al navegar por el menú.

**Fuentes auto-alojadas.** `next/font` descarga Nunito y Ubuntu en build y las
sirve desde el propio dominio. Sustituye al `@import` de Google Fonts, que
bloqueaba el render y obligaba a abrir la CSP a un tercero.

---

## Accesibilidad

Verificado sobre el DOM renderizado, no sólo sobre el código:

- Un único `<h1>` y jerarquía de encabezados sin saltos.
- Todos los campos del formulario con `<label>` asociado — no sólo
  `placeholder`.
- Errores anunciados con `aria-invalid` + `aria-describedby`; el resultado del
  envío en una región `role="status" aria-live="polite"` (sustituye al
  `alert()` bloqueante de la versión anterior).
- Enlace «saltar al contenido» como primer elemento enfocable.
- Menú móvil: `inert` cuando está cerrado, cierre con `Escape`, foco
  devuelto al botón que lo abrió, scroll del fondo bloqueado.
- Objetivos táctiles de 44 px de alto mínimo (WCAG 2.2 · 2.5.8).
- `prefers-reduced-motion` respetado en todas las animaciones.
- Sin desbordamiento horizontal desde 320 px.
- Cambiar de idioma conserva la sección que se estaba leyendo y el tema
  elegido, y refleja la sección en el `hash` para que el enlace se pueda
  compartir.

---

## Despliegue en Vercel

```bash
npm i -g vercel
vercel link
vercel env add RESEND_API_KEY production      # y el resto
vercel --prod
```

O conecta el repositorio en [vercel.com/new](https://vercel.com/new): cada
push a `main` despliega a producción y cada PR genera un preview.

Después del primer despliegue, actualiza `NEXT_PUBLIC_SITE_URL` con el dominio
real — de ahí salen el canonical, el sitemap y las etiquetas Open Graph.

---

## Cómo actualizar el contenido

| Quiero… | Toco… |
| --- | --- |
| Añadir un proyecto | Ver [Añadir un proyecto](#añadir-un-proyecto) |
| Añadir una habilidad | `src/content/site.ts` → `skillGroups[]` (elige el ámbito), el icono en `src/components/icons/` y el nombre en `skills.items` de los mensajes |
| Cambiar un texto | `src/messages/es.json` y `src/messages/en.json` (las claves deben coincidir en ambos) |
| Cambiar los colores | `src/app/globals.css` → `:root` (oscuro, por defecto) y `html[data-theme='light']` |
| Añadir un ámbito de habilidades | `src/content/site.ts` → `SkillGroupId` y `skillGroups[]`, más su título en `skills.groups` |
| Cambiar el CV | Reemplazar `public/documents/Dennis-Landaverde-CV.pdf` |
| Cambiar la foto | Reemplazar `public/images/portrait.jpg` (cuadrada, ~1000 px) |
| Añadir un idioma | `src/i18n/routing.ts` → `locales`, más un nuevo `src/messages/<code>.json` |

---

## Añadir un proyecto

Son tres ficheros y ningún componente que tocar.

**1 · La imagen** — en `public/images/`, apaisada (16:10 va bien; la tarjeta la
muestra en 16:9 con `object-contain`, así que nada se recorta). Usa `.jpg` para
capturas y fotos, `.png` sólo si necesitas transparencia. Apunta el ancho y el
alto reales: se declaran abajo y son los que evitan que la página dé un salto
mientras carga.

```bash
sips -g pixelWidth -g pixelHeight public/images/mi-proyecto.jpg
```

**2 · Los datos** — en `src/content/site.ts`:

```ts
export type ProjectId = 'portfolio' | 'mi-proyecto';   // ← añade el id

export const projects: readonly Project[] = [
  {
    id: 'mi-proyecto',
    image: '/images/mi-proyecto.jpg',
    imageWidth: 1280,          // los de `sips`, no inventados
    imageHeight: 800,
    stack: ['Angular', 'Quarkus', 'Oracle Database'],
    sourceUrl: 'https://github.com/dglandaverde/mi-proyecto',  // opcional
    liveUrl: 'https://mi-proyecto.com',                        // opcional
    featured: true,
  },
  // …los demás
] as const;
```

`sourceUrl` y `liveUrl` son opcionales: si omites uno, su botón no se dibuja.
TypeScript te avisará si olvidas algún campo.

**3 · Los textos** — la misma clave en `src/messages/es.json` **y**
`src/messages/en.json`, dentro de `projects.items`:

```json
"mi-proyecto": {
  "title": "Nombre del proyecto",
  "description": "Qué resuelve y con qué lo construiste. Dos líneas bastan.",
  "imageAlt": "Captura de la pantalla principal de Nombre del proyecto"
}
```

Las claves deben coincidir en ambos idiomas. Para comprobarlo:

```bash
npm run typecheck && npm run build
```

Si falta una clave en uno de los idiomas, el build falla y te dice cuál.

La rejilla ya está preparada para 3 columnas en escritorio, 2 en tablet y 1 en
móvil: no hay que tocar nada de maquetación al añadir proyectos.

---

## Licencia

MIT. El contenido personal, las imágenes y el CV no están cubiertos por la
licencia.
