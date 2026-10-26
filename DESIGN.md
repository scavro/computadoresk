---
name: Fundamentos de Computadores
description: Álbum de estudio local para Fundamentos de Computadores, con apuntes, ejercicios, examen y prácticas.
colors:
  primary: "#173650"
  primary-deep: "#10283c"
  accent: "#b84635"
  accent-dark: "#963426"
  gold: "#c7a154"
  paper: "#f2eddf"
  paper-light: "#fbf8ee"
  paper-dark: "#e3ddcf"
  ink: "#1b2b35"
  muted: "#52636a"
  ghost: "#a9aaa2"
  line: "#c9c2b2"
  success: "#2e6d56"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(3rem, 5vw, 5.375rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.02em"
  body:
    fontFamily: "Public Sans Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.72
  nav:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1
  title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1
  label:
    fontFamily: "Azeret Mono Variable, monospace"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "7px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#fffaf0"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
  sticker:
    backgroundColor: "#f9f6eb"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "16px"
  reading-sheet:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "26px 20px"
---

# Design System: Fundamentos de Computadores

## Overview

**Creative North Star: "El álbum técnico de laboratorio"**

La interfaz se comporta como un álbum de estudio encuadernado, no como un dashboard. Las páginas tienen peso de papel, las posiciones numeradas ordenan el progreso y cada colección conserva su función: leer, resolver, ensayar y manipular modelos. La densidad es alta pero ritmada: grupos estrechos, separaciones generosas y más espacio por encima de cada título que por debajo.

**Key Characteristics:**

- Papel mate marfil frío con textura sutil, no blanco clínico.
- Azul tinta como color principal y rojo coleccionista como acción.
- Tipografía condensada para titulares y sans legible para lectura prolongada.
- Ranuras, sellos y sombras desplazadas con desenfoque.
- Movimiento contenido, con un único gesto de asentamiento por interacción.

## Colors

La paleta recuerda a una encuadernación técnica: papel, tinta, sellos y registro.

### Primary

- **Azul tinta** (#173650): estructura, navegación, títulos y superficies de autoridad.

### Secondary

- **Rojo coleccionista** (#b84635): acciones principales, números de ejercicio y foco.

### Tertiary

- **Oro de registro** (#c7a154): etiquetas, marcadores y detalle de laboratorio.

### Neutral

- **Papel** (#f2eddf): fondo general.
- **Papel claro** (#fbf8ee): hojas de lectura y superficies de trabajo.
- **Tinta** (#1b2b35): texto de lectura.
- **Gris de archivo** (#52636a): texto secundario y metadatos.
- **Línea de álbum** (#c9c2b2): divisores y bordes suaves.
- **Verde de progreso** (#2e6d56): estados completados.

### Named Rules

**The Album Spine Rule.** El color rojo aparece como acento de acción y numeración, no como fondo dominante. Su rareza marca la siguiente posición.

## Typography

**Display Font:** Barlow Condensed (600, 700, 800)  
**Body Font:** Public Sans Variable  
**Label/Mono Font:** Azeret Mono Variable

**Character:** Los titulares son compactos y en mayúsculas; el cuerpo prioriza legibilidad y medida de 75 caracteres.

### Hierarchy

- **Display** (700, clamp(3rem, 5vw, 5.375rem), 0.95): titulares de portada y páginas.
- **Headline** (700, clamp(2rem, 3vw, 2.6875rem), 1.05): títulos de sección.
- **Title** (700, 1.625rem, 1): encabezados de hojas y paneles.
- **Body** (400, 1rem, 1.72): lectura principal, con líneas preservadas para fórmulas.
- **Label** (700, 0.625rem, 0.08em, uppercase): metadatos, ranuras y etiquetas.

### Named Rules

**The No Kicker Rule.** Los títulos no necesitan etiquetas superiores; su peso y escala deben bastar.

## Layout

La portada usa una cuadrícula de dos columnas: texto a la izquierda y álbum desplegado a la derecha. El lector usa un índice lateral fijo y una columna de lectura con hojas individuales. Las colecciones usan listas y filas, no cuadrículas uniformes de tarjetas idénticas. Los breakpoints principales son 1250, 1020, 760 y 430 px. Las fórmulas y tablas pueden desplazarse horizontalmente cuando la medida lo exige.

## Elevation & Depth

La profundidad es ambiental y desplazada, no decorativa. Las hojas usan sombras suaves con desenfoque; no se emplean sombras duras de cero desenfoque ni glassmorphism.

### Shadow Vocabulary

- **Hoja** (`box-shadow: 0 14px 30px -16px rgb(16 40 60 / 38%), 0 3px 7px rgb(16 40 60 / 10%)`): hojas de lectura y paneles.
- **Álbum** (`box-shadow: 0 34px 50px -25px rgb(16 40 60 / 48%), 0 8px 15px rgb(16 40 60 / 13%)`): portada del álbum.
- **Botón** (`box-shadow: 0 3px 8px rgb(16 40 60 / 10%), 0 1px 2px rgb(16 40 60 / 8%)`): botones en reposo.

### Named Rules

**The Soft Shadow Rule.** Toda sombra debe tener desenfoque y una intención de elevación; un halo de color a cero desplazamiento no es profundidad.

## Shapes

Las esquinas son discretas: 2, 3, 4 y 7 px. Los botones son rectangulares con radio de 3 px. Las hojas y paneles usan 4 a 7 px. Las ranuras del álbum tienen bordes punteados y las piezas satinadas tienen un borde interior fino. No se usan máscaras geométricas como sustituto de contornos reales.

## Components

### Buttons

- **Shape:** radio de 3 px, borde de 1 px.
- **Primary:** fondo rojo coleccionista, texto marfil, padding 12px 20px.
- **Hover / Focus:** desplazamiento vertical de 2 px, sombra de hoja y contorno rojo en foco.
- **Secondary:** fondo papel claro, texto azul tinta.

### Stickers

- **Shape:** radio de 4 px, borde de 1 px y borde interior fino.
- **Style:** fondo marfil, sombra desplazada, elevación al pasar.
- **State:** las posiciones completadas cambian a verde de progreso.

### Cards / Containers

- **Corner Style:** 4 a 7 px.
- **Background:** papel claro o azul tinta según jerarquía.
- **Shadow Strategy:** sombras ambientales de hoja.
- **Border:** 1 px en línea de álbum.

### Inputs / Fields

- **Style:** fondo papel claro, borde de 1 px, sin radio.
- **Focus:** borde azul tinta y anillo suave.

### Navigation

- **Style:** tipografía display, enlaces centrados, activo en rojo con borde inferior.
- **Mobile:** menú desplegable de tres columnas y botón de menú visible.

### Album Spread

- **Style:** dos páginas con costura central, ranuras numeradas y piezas con relieve.
- **Interaction:** las piezas se asientan en su ranura con un gesto elástico; existe equivalente sin movimiento.

## Do's and Don'ts

### Do:

- **Do** usar papel y tinta como base, con rojo solo para acción y numeración.
- **Do** preservar referencias a la fuente y página original.
- **Do** marcar claramente el material de repaso no oficial.
- **Do** mantener el texto de lectura por debajo de 75 caracteres por línea.

### Don't:

- **Don't** usar tarjetas idénticas de icono, título y texto como estructura principal.
- **Don't** usar gradientes de texto, glassmorphism decorativo o sombras duras.
- **Don't** convertir los temas futuros en promesas oficiales.
- **Don't** publicar el material docente íntegro sin verificar permisos.
