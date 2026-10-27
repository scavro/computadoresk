# Fundamentos de Computadores

Web local de estudio para la asignatura **Fundamentos de Computadores (7103104-)** del Grado en Ingeniería en Inteligencia Artificial de la UNED.

La primera versión funcional está implementada: apuntes, ejercicios, examen, prácticas y progreso local.

## Contenido previsto

- Apuntes completos del Tema 1.
- Tema 2, parte 1 disponible.
- Ejemplos y ejercicios resueltos de los apuntes.
- Ejercicios propuestos del Tema 1 con soluciones separadas.
- 15 ejercicios nuevos tipo examen con soluciones.
- Prácticas interactivas en el navegador.
- Progreso guardado localmente.

Consulta el plan completo en [PLAN.md](PLAN.md).

## Requisitos

- Node.js 20 o superior.
- npm.

## Puesta en marcha

```bash
npm install
npm run dev
```

La dirección local aparecerá en la terminal, normalmente `http://localhost:5173`.

## Comandos previstos

```bash
npm run dev            # Servidor local
npm run build          # Compilación de producción
npm run preview        # Vista previa de la compilación
npm run test           # Pruebas
npm run lint           # Comprobaciones de código
npm run content:extract # Regenera el contenido local desde los PDF originales
```

## Estructura

La estructura definitiva se documentará al implementar la Fase 1. El contenido de los apuntes estará separado de los componentes de interfaz para facilitar la incorporación de futuros temas.

## Material docente

Los apuntes, ejercicios y soluciones originales pertenecen a su equipo docente y a la UNED. Se incluyen en este repositorio y en la web desplegada como apoyo al estudio personal; no son publicaciones oficiales de la asignatura. El contenido extraído puede regenerarse con `npm run content:extract` desde los PDF de `public/fuentes/`.

## Estado

- [x] Planificación inicial.
- [x] Repositorio Git preparado.
- [x] Fase 1: base de la aplicación.
- [x] Fase 2: apuntes.
- [x] Fase 3: ejercicios existentes.
- [x] Fase 4: banco de examen.
- [x] Fase 5: prácticas interactivas.
- [x] Fase 6: pruebas y accesibilidad.
- [x] Fase 7: publicación.

## Publicación

- Repositorio: [scavro/computadoresk](https://github.com/scavro/computadoresk) (rama `main`).
- Despliegue: Cloudflare Pages conectado al repositorio; cada push a `main` reconstruye y publica la web automáticamente.
- El despliegue público incluye el material docente completo (apuntes, ejercicios y PDFs originales) para estudiar desde cualquier equipo.
