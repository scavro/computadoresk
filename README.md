# Fundamentos de Computadores

Web de estudio estilo *Álbum técnico de laboratorio* para la asignatura **Fundamentos de Computadores (7103104-)** del Grado en Ingeniería en Inteligencia Artificial de la UNED.

## Contenido incluido (Bloque I completo)

- **Apuntes completos de los Temas 1, 2, 3 y 4**, con ejemplos encuadrados, notas, figuras extraídas y referencias directas de página a los PDFs encuadernados con sus portadas:
  - **Tema 1:** Representación de la información y estructura básica de un computador (92 págs., 48 ejemplos, 12 figuras).
  - **Tema 2:** Unidad de memoria completa, incluyendo memoria caché, asociativa y secundaria HDD/SSD/ópticos/cinta (138 págs., 32 ejemplos, 44 figuras).
  - **Tema 3:** Unidad de entrada/salida: controladores, E/S programada, interrupciones, DMA, canales y GPU (82 págs., 25 ejemplos, 22 figuras).
  - **Tema 4:** Unidad central de procesamiento: puertas y ALU, repertorios RISC-V/ARM/x86-64, modos de direccionamiento, ruta de datos, segmentación, unidad de control y GPUs/NPUs/TPUs (92 págs., 21 figuras).
- **91 ejercicios oficiales resueltos + cuestionario interactivo**:
  - 27 ejercicios del Tema 1 con soluciones separadas.
  - 45 ejercicios del Tema 2 + problema adicional de caché asociativa por conjuntos (LRU frente a FIFO) + **cuestionario interactivo de 10 preguntas sobre memoria caché**.
  - 18 actividades de autoevaluación y problemas del Tema 3 con soluciones.
- **Banco tipo examen de 25 problemas originales (`E01`–`E25`)** repartidos por los 4 temas, con simulacro cronometrado de 5 problemas en 120 minutos.
- **12 prácticas interactivas (`P01`–`P12`)**:
  - Conversores, enteros, coma fija/IEEE 754, multimedia, procesador/buses, memoria y DDR.
  - **2 escenas 3D interactivas con Three.js:** bancos de chips con decodificador (`P07`) y geometría física de disco duro magnético con platos, cilindros, pistas y sectores (`P10`).
  - **Simuladores interactivos SVG + GSAP:** memoria caché paso a paso (`P09`), comparador de E/S programada / interrupciones / DMA por robo de ciclos (`P11`) y ruta de datos / segmentación RISC de 5 etapas con *forwarding* (`P12`).

## Puesta en marcha

```bash
npm install
npm run dev
```

## Comandos principales

```bash
npm run dev             # Servidor local de desarrollo
npm run build           # Verificación de contenido + compilación de producción
npm run preview         # Vista previa local de dist/
npm run test            # Pruebas unitarias (Vitest)
npm run lint            # Análisis estático (ESLint)
npm run smoke           # Prueba end-to-end en navegador (Playwright)
npm run content:extract # Regenera JSONs, figuras WebP y PDFs con portadas desde APUNTES/
npm run content:check   # Verifica apuntes, figuras, portadas, ejercicios y PDFs
```

## Publicación

- Repositorio: [scavro/computadoresk](https://github.com/scavro/computadoresk) (rama `main`).
- Despliegue continuo en Cloudflare Pages al hacer `push` a `main`.
