import type { Locale } from '@/i18n/routing';

/* ════════════════════════════════════════════════════════════════
   CONTENIDO DEL PORTAFOLIO
   ════════════════════════════════════════════════════════════════
   Punto único donde se define qué aparece en la web: datos personales,
   enlaces sociales, habilidades, servicios y proyectos.

   Este fichero NO contiene textos.
   Sólo guarda identificadores (`html`, `react`, `clinicplus`…), enlaces y
   medidas. Las palabras que se leen en pantalla viven en
   src/messages/es.json y src/messages/en.json, bajo esa misma clave.

   El motivo de la separación es el bilingüismo: con el texto aquí dentro
   habría que duplicar el fichero entero por idioma. Así el orden y la
   estructura se definen una vez y cada idioma aporta sólo sus palabras.

   Regla al añadir contenido: toda entrada nueva necesita su texto en los
   DOS ficheros de idioma. Si falta en alguno, la compilación se detiene
   indicando la clave concreta.
   ════════════════════════════════════════════════════════════════ */

/**
 * Datos básicos del sitio.
 *
 * `cvPath` apunta al PDF dentro de la carpeta `public`. Sustituir ese
 * fichero conservando el nombre actualiza el CV sin tocar código.
 */
export const siteConfig = {
  name: 'Dennis Landaverde',
  role: 'Software Engineer',
  location: 'El Salvador',
  cvPath: '/documents/Dennis-Landaverde-CV.pdf',
  repository: 'https://github.com/dglandaverde/Portfolio',
} as const;

/* ─── Navegación ─────────────────────────────────────────────── */

/**
 * Secciones del menú, en el orden en que aparecen.
 *
 * Cada nombre coincide con el `id` de su sección en la página y con su
 * clave en "nav" de los ficheros de idioma. Una entrada nueva aparece a
 * la vez en el menú de escritorio y en el de móvil.
 */
export const navSections = ['home', 'about', 'skills', 'services', 'projects', 'contact'] as const;

export type NavSection = (typeof navSections)[number];

/* ─── Redes sociales ─────────────────────────────────────────── */

export type SocialPlatform = 'linkedin' | 'github' | 'x' | 'instagram';

/**
 * Perfiles sociales.
 *
 * La portada y el pie leen de esta misma lista, de modo que un cambio
 * aquí se refleja en ambos sitios.
 *
 * Una red nueva requiere además su icono en
 * src/components/icons/index.tsx, dentro de `socialIcons`.
 */
export const socialLinks: ReadonlyArray<{
  platform: SocialPlatform;
  label: string;
  href: string;
}> = [
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/dennislandaverde/',
  },
  { platform: 'github', label: 'GitHub', href: 'https://github.com/dglandaverde' },
  { platform: 'x', label: 'X', href: 'https://x.com/dennis_land10' },
  { platform: 'instagram', label: 'Instagram', href: 'https://instagram.com/dennislandaverde' },
] as const;

/* ─── Habilidades ────────────────────────────────────────────── */

export type SkillId =
  | 'html'
  | 'css'
  | 'scss'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'angular'
  | 'tailwind'
  | 'java'
  | 'quarkus'
  | 'oracle'
  | 'jdedwards';

export type SkillGroupId = 'frontend' | 'backend' | 'data';

/**
 * Habilidades agrupadas por ámbito.
 *
 * El agrupamiento no es decorativo: una rejilla plana situaría HTML al
 * mismo nivel que JD Edwards y quien lee no distinguiría dónde encaja
 * cada cosa. Así el alcance del perfil se entiende de un vistazo.
 *
 * `color` es el tono oficial de marca y sólo aparece al pasar el cursor.
 * Angular publica el suyo en negro (#0F0F11), invisible sobre fondo oscuro,
 * así que se usa su rojo característico. Oracle Database y JD Edwards no
 * tienen logo público —Oracle lo retiró de Simple Icons—, y comparten el
 * rojo corporativo de Oracle por ser productos de la misma casa.
 */
export const skillGroups: ReadonlyArray<{
  id: SkillGroupId;
  skills: ReadonlyArray<{ id: SkillId; color: string }>;
}> = [
  {
    id: 'frontend',
    skills: [
      { id: 'html', color: '#e34f26' },
      { id: 'css', color: '#663399' },
      { id: 'scss', color: '#cc6699' },
      { id: 'javascript', color: '#f7df1e' },
      { id: 'typescript', color: '#3178c6' },
      { id: 'react', color: '#61dafb' },
      { id: 'angular', color: '#dd0031' },
      { id: 'tailwind', color: '#06b6d4' },
    ],
  },
  {
    id: 'backend',
    skills: [
      { id: 'java', color: '#e76f00' },
      { id: 'quarkus', color: '#4695eb' },
    ],
  },
  {
    id: 'data',
    skills: [
      { id: 'oracle', color: '#c74634' },
      { id: 'jdedwards', color: '#c74634' },
    ],
  },
] as const;

/** Lista plana, para los datos estructurados y cualquier recorrido simple. */
export const allSkills = skillGroups.flatMap((group) => group.skills);

/* ─── Servicios ──────────────────────────────────────────────── */

/**
 * Servicios ofrecidos.
 *
 * El icono de cada uno se asigna en `serviceIcons`, dentro de
 * src/components/sections/services.tsx. El título y la descripción van en
 * "services.items" de los ficheros de idioma.
 */
export type ServiceId = 'web' | 'database';

export const services: ReadonlyArray<{ id: ServiceId }> = [
  { id: 'web' },
  { id: 'database' },
] as const;

/* ─── Proyectos ──────────────────────────────────────────────── */

export type ProjectId = 'portfolio' | 'clinicplus';

/**
 * Estructura de cada proyecto.
 *
 * Los campos marcados con `?` son opcionales: al omitir `sourceUrl` o
 * `liveUrl`, ese botón no se dibuja en la tarjeta. La falta de un campo
 * obligatorio detiene la compilación señalando cuál.
 *
 * El procedimiento completo para añadir un proyecto está en el README.
 */
export interface Project {
  /** Identificador único. Existe con el mismo nombre en "projects.items" de los ficheros de idioma. */
  id: ProjectId;
  /** Ruta de la imagen dentro de `public`. */
  image: string;
  /** Ancho/alto intrínsecos: evitan Cumulative Layout Shift al cargar. */
  imageWidth: number;
  imageHeight: number;
  stack: readonly string[];
  sourceUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export const projects: readonly Project[] = [
  {
    id: 'clinicplus',
    image: '/images/project-clinicplus.jpg',
    imageWidth: 1280,
    imageHeight: 800,
    // Sólo lo que hay en el repositorio enlazado: el backend (NestJS,
    // PostgreSQL, Prisma) vive en otro repositorio y se menciona en la
    // descripción, no aquí.
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    sourceUrl: 'https://github.com/dglandaverde/ClinicPlus',
    featured: true,
  },
  {
    id: 'portfolio',
    image: '/images/project-portfolio.jpg',
    imageWidth: 1280,
    imageHeight: 800,
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    sourceUrl: 'https://github.com/dglandaverde/Portfolio',
    liveUrl: 'https://portfolio-nu-eosin-11.vercel.app',
    featured: true,
  },
] as const;

/* ─── Datos estructurados (JSON-LD) ──────────────────────────── */

/**
 * Esquema Person de schema.org. Es lo que permite que Google muestre el panel
 * de conocimiento y asocie los perfiles sociales a la misma persona.
 */
export function buildPersonJsonLd(siteUrl: string, locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.name,
    url: `${siteUrl}/${locale}`,
    image: `${siteUrl}/images/portrait.jpg`,
    jobTitle: siteConfig.role,
    // El correo NO se publica en los datos estructurados: sería alimento
    // directo para rastreadores de spam. El canal público es el formulario,
    // y la dirección real vive en CONTACT_TO_EMAIL, sólo en el servidor.
    description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SV',
    },
    sameAs: socialLinks.map((link) => link.href),
    knowsAbout: [
      'HTML',
      'CSS',
      'SCSS',
      'JavaScript',
      'TypeScript',
      'React',
      'Angular',
      'Tailwind CSS',
      'Java',
      'Quarkus',
      'Oracle Database',
      'JD Edwards',
    ],
  } as const;
}
