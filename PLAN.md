# Plan del proyecto — Fundamentos de Computadores

**Asignatura:** Fundamentos de Computadores (7103104-)  
**Titulación:** Grado en Ingeniería en Inteligencia Artificial  
**Curso:** 2026–2027  
**Estado:** planificación terminada; aplicación pendiente de implementación  
**Ubicación local:** `/home/scavro/AAA Uned/Fundamentos de computadores/CURSO KIMI`

---

## 1. Objetivo

Construir una web de estudio que funcione localmente y que pueda versionarse y publicarse mediante GitHub. La primera versión incluirá:

- Los apuntes completos de los dos primeros temas disponibles.
- Los ejemplos resueltos integrados en la teoría.
- Los ejercicios propuestos del Tema 1 con sus soluciones.
- Un banco de 15 ejercicios nuevos tipo examen con soluciones separadas.
- Prácticas interactivas realizadas directamente en el navegador.
- Seguimiento local del progreso del estudiante.
- Documentación para ejecutar, modificar y publicar el proyecto.

No se modificarán los PDF originales de la asignatura.

---

## 2. Alcance de la primera versión

### 2.1. Contenidos incluidos

| Material | Alcance |
|---|---|
| Tema 1 | Completo: representación de la información, estructura del computador, von Neumann y buses |
| Tema 2 | Parte 1 disponible: desde la introducción hasta los módulos de memoria y DDR SDRAM (2.6.3) |
| Ejemplos resueltos | 48 del Tema 1 y 11 del Tema 2 |
| Ejercicios propuestos | 27 del Tema 1 con sus 27 soluciones |
| Examen | 15 ejercicios nuevos y 15 soluciones separadas |
| Prácticas | 8 laboratorios interactivos |
| Información académica | Evaluación, examen, PEC y plan de trabajo |

El Tema 2 se marcará expresamente como **Parte 1**. No se presentarán como oficiales los contenidos de caché o memoria secundaria que todavía no forman parte del PDF suministrado.

Tampoco existe por ahora un documento independiente de ejercicios propuestos del Tema 2. Los 11 ejemplos resueltos disponibles se integrarán en sus apartados correspondientes.

### 2.2. Distinción del material

Cada contenido mostrará su procedencia:

- **Material de la UNED:** apuntes, ejemplos y ejercicios oficiales.
- **Material de repaso:** los 15 ejercicios tipo examen y las prácticas interactivas.
- **Información académica:** datos de la guía docente y del documento informativo.

---

## 3. Requisitos funcionales

### 3.1. Páginas principales

| Ruta | Función |
|---|---|
| `/` | Inicio, presentación, accesos rápidos y progreso |
| `/temas/1` | Apuntes completos del Tema 1 |
| `/temas/2` | Apuntes disponibles del Tema 2 |
| `/ejercicios/tema-1` | Los 27 enunciados |
| `/ejercicios/tema-1/soluciones` | Las 27 soluciones, separadas |
| `/examen` | Presentación y modo simulacro |
| `/examen/ejercicios` | Los 15 enunciados E01–E15 |
| `/examen/soluciones` | Las 15 soluciones completas |
| `/practicas` | Catálogo de prácticas y progreso |
| `/practicas/:id` | Laboratorio interactivo |
| `/guia` | Evaluación y características del examen |
| `/fuentes` | Documentos originales y notas de procedencia |

### 3.2. Apuntes

- Índice lateral fiel a la numeración original.
- Navegación entre secciones y subsecciones.
- Fórmulas renderizadas con KaTeX.
- Tablas, notas, definiciones y ejemplos con estilos diferenciados.
- Figuras numeradas con su título original.
- Enlaces a la página correspondiente del PDF.
- Botón para abrir o descargar el documento fuente.
- Buscador local de términos.
- Diseño adaptable a escritorio, tableta y móvil.
- Impresión limpia de cualquier apartado.

No se insertará únicamente el PDF: el contenido se convertirá a HTML semántico para que sea navegable, accesible y adaptable.

### 3.3. Ejercicios propuestos

- Los enunciados y las soluciones estarán en páginas distintas.
- Numeración exacta del documento original.
- Cada ejercicio enlazará con el apartado teórico relacionado.
- Las soluciones estarán ocultas inicialmente.
- Se podrá revelar una solución concreta sin mostrar las demás.
- Se conservará el desarrollo completo, no solo el resultado.
- Modo de impresión para estudiante y para corrección.

### 3.4. Ejercicios tipo examen

- 15 ejercicios originales identificados como `E01`–`E15`.
- Enunciados y soluciones en secciones independientes.
- Soluciones con datos, fórmulas, sustituciones, unidades, resultado y justificación.
- Modo simulacro de 5 ejercicios y 120 minutos.
- Temporizador pausable y ocultable.
- Posibilidad de imprimir el simulacro.
- Sin corrección automática de respuestas abiertas.
- Etiqueta visible de **material de repaso no oficial**.

#### Distribución prevista

| Ejercicio | Contenido |
|---|---|
| E01 | Conversiones decimal, binaria, octal y hexadecimal, incluidas fracciones |
| E02 | Codificación de N elementos, unidades de información y BCD 8421 |
| E03 | Rangos, número mínimo de bits, sin signo, signo-magnitud, C1, C2 y exceso |
| E04 | Coma fija: rango, resolución, codificación e interpretación |
| E05 | Normalización binaria e IEEE 754 de precisión simple |
| E06 | ASCII, Unicode y UTF-8 |
| E07 | Tamaño de imágenes, audio y vídeo sin comprimir |
| E08 | Organización de memoria, unidades direccionables y palabras |
| E09 | Rendimiento del procesador: reloj, CPI, tiempo y MIPS |
| E10 | Buses, multiplexación, ancho de banda y ocupación |
| E11 | Parámetros de rendimiento y métodos de acceso a memoria |
| E12 | Jerarquía, localidad y comparación de tipos de memoria |
| E13 | Ampliación del número de bits por unidad direccionable |
| E14 | Ampliación del número de direcciones y uso de decodificadores |
| E15 | Problema integrado de ampliación, módulos y ancho de banda DDR |

### 3.5. Prácticas interactivas

1. **Conversor de sistemas de numeración:** enteros, fracciones y pasos intermedios.
2. **Laboratorio de enteros con signo:** bits interactivos, rangos y desbordamiento.
3. **Coma fija e IEEE 754:** configuración de formato, codificación y decodificación.
4. **Calculadora de almacenamiento multimedia:** imagen, audio y vídeo.
5. **Rendimiento de procesador y buses:** CPI, MIPS, ancho de banda y ocupación.
6. **Explorador de memoria y direcciones:** capacidad, direcciones y palabras.
7. **Diseñador de ampliaciones de memoria:** circuitos, grupos, decodificador y esquema SVG.
8. **Laboratorio DDR SDRAM:** reloj, MT/s, anchura y ancho de banda.

Cada práctica incluirá:

- Objetivo.
- Instrucciones.
- Espacio de trabajo interactivo.
- Ejercicios propuestos.
- Comprobación de entradas y resultados.
- Explicación paso a paso.
- Enlace a la teoría relacionada.
- Persistencia del progreso en el navegador.

Las prácticas son material de apoyo y no sustituyen a la PEC/PED oficial. Cuando se publique el enunciado oficial se añadirá un apartado específico.

### 3.6. Progreso

Se almacenará localmente, sin cuentas ni servidor:

- Secciones leídas.
- Ejemplos consultados.
- Ejercicios resueltos y soluciones reveladas.
- Resultados de las prácticas.
- Preferencias de visualización.
- Posibilidad de restablecer el progreso.

Los datos no se enviarán a ningún servicio externo.

---

## 4. Requisitos no funcionales

- Funcionamiento local sin backend.
- Ninguna dependencia de red durante el uso normal.
- Accesibilidad: teclado, foco visible, contraste y textos alternativos.
- Diseño adaptable y sin desplazamiento horizontal innecesario.
- Fórmulas y tablas legibles en pantallas pequeñas.
- Tiempos de carga razonables y división del contenido por rutas.
- Código tipado y modular.
- Cálculos separados de la interfaz para poder probarlos.
- Documentación suficiente para añadir los temas 3–10.
- Historial de cambios mediante Git.
- Preparación para integración continua y publicación estática.

---

## 5. Arquitectura técnica

### 5.1. Tecnologías

- Vite.
- React.
- TypeScript.
- React Router.
- MDX para los contenidos.
- KaTeX para matemáticas.
- CSS propio.
- Vitest y Testing Library.
- Playwright para comprobaciones de navegador, si aporta valor al cierre.

No se utilizará base de datos ni servidor de aplicaciones.

### 5.2. Estructura prevista

```text
CURSO KIMI/
├── README.md
├── PLAN.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/
│   ├── fuentes/
│   └── figuras/
├── src/
│   ├── app/
│   ├── components/
│   ├── content/
│   │   ├── tema-1/
│   │   ├── tema-2/
│   │   ├── ejercicios/
│   │   │   ├── enunciados/
│   │   │   └── soluciones/
│   │   └── examen/
│   │       ├── enunciados/
│   │       └── soluciones/
│   ├── practices/
│   │   ├── components/
│   │   └── logic/
│   ├── styles/
│   └── tests/
└── ...
```

El contenido estará separado de la presentación para facilitar la incorporación de nuevos temas.

### 5.3. Ejecución prevista

```bash
cd "CURSO KIMI"
npm install
npm run dev
```

Comandos previstos:

```bash
npm run build
npm run preview
npm run test
npm run lint
```

---

## 6. Fuentes y fidelidad

Documentos de partida:

- `apuntes_FC_Tema01_completo_v3.pdf` — 92 páginas.
- `apuntes_FC_Tema02_parte1.pdf` — 49 páginas.
- `FC_Tema1_ ejercicios.pdf` — 27 enunciados.
- `FC_Tema1_ soluciones.pdf` — 27 soluciones.
- `FC_información_básica.pdf` — información académica.
- `7103104-_2027.pdf` — guía docente.

Proceso de conversión:

1. Extraer texto y estructura de cada PDF.
2. Convertir el contenido a HTML/MDX semántico.
3. Rehacer fórmulas con KaTeX.
4. Extraer o redibujar figuras.
5. Conservar numeración de ecuaciones, ejemplos, tablas y figuras.
6. Registrar la página de origen de cada apartado.
7. Comparar visualmente con el PDF.
8. Revisar ortografía, unidades y símbolos matemáticos.
9. Verificar que no falten páginas ni apartados.

La fidelidad al contenido original tiene prioridad sobre la creatividad visual.

---

## 7. Preparación para GitHub

### 7.1. Estado inicial del repositorio

- Repositorio Git local inicializado.
- Rama principal: `main`.
- Sin remoto configurado todavía.
- `.gitignore` preparado para Node, dependencias, compilaciones y archivos locales.
- `README.md` con instrucciones de ejecución y publicación.
- Plan del proyecto versionado en `PLAN.md`.

### 7.2. Primer remoto y publicación

Una vez creado el repositorio en GitHub:

```bash
git remote add origin git@github.com:USUARIO/fundamentos-computadores.git
git push -u origin main
```

Se recomienda que el repositorio sea **privado** inicialmente.

### 7.3. Advertencia sobre el material docente

Los apuntes, ejercicios y soluciones pertenecen a sus autores y a la UNED. Antes de hacer público el repositorio se debe:

- Confirmar que se permite su redistribución, o
- Mantener el repositorio privado, o
- Publicar la web sin los documentos originales y sin reproducir íntegramente su contenido.

El código propio puede publicarse aparte, pero no se añadirá una licencia al contenido de la UNED sin autorización.

### 7.4. Flujo de trabajo

- Ramas cortas para cada cambio relevante.
- Mensajes de commit descriptivos.
- Revisión visual antes de cada fusión.
- Etiquetas para versiones estables.
- Un único commit inicial de planificación y configuración.
- Commits posteriores por bloques funcionales.

Ejemplos de ramas:

```text
feat/base-aplicacion
feat/apuntes-tema-1
feat/ejercicios-tema-1
feat/banco-examen
feat/practicas-interactivas
fix/navegacion-movil
```

### 7.5. Integración continua y GitHub Pages

Cuando exista la aplicación se añadirá un flujo de GitHub Actions que:

1. Instale dependencias con `npm ci`.
2. Ejecute comprobaciones y pruebas.
3. Compile la web.
4. Publique la compilación estática en GitHub Pages, si el repositorio puede ser público.

La configuración de Vite permitirá establecer el `base` necesario para Pages. La publicación se aplazará hasta decidir el régimen público/privado del material.

---

## 8. Fases de implementación

### Fase 1 — Base del proyecto

- Inicializar Vite, React y TypeScript.
- Configurar rutas, navegación y estilos base.
- Crear el diseño general.
- Preparar el sistema de contenido.
- Verificar arranque y compilación.

### Fase 2 — Apuntes

- Convertir el Tema 1 completo.
- Convertir el Tema 2, parte 1.
- Incorporar fórmulas, tablas y figuras.
- Enlazar páginas de los PDF.
- Revisar fidelidad y navegación.

### Fase 3 — Ejercicios existentes

- Incorporar los 27 enunciados.
- Incorporar las 27 soluciones.
- Crear el sistema de revelado y el modo de impresión.
- Comprobar correspondencia exacta.

### Fase 4 — Banco de examen

- Redactar E01–E15.
- Resolverlos de forma independiente.
- Verificar todos los cálculos.
- Crear soluciones separadas.
- Implementar el simulacro y el temporizador.

### Fase 5 — Prácticas

- Implementar la lógica de cálculo.
- Crear las ocho interfaces.
- Añadir validaciones, pasos y explicaciones.
- Guardar progreso.

### Fase 6 — Calidad

- Pruebas unitarias de fórmulas y conversiones.
- Pruebas de rutas y componentes.
- Revisión de accesibilidad.
- Revisión en móvil y tableta.
- Comprobación de impresión.
- Corrección de enlaces y erratas.

### Fase 7 — GitHub y entrega

- Añadir CI.
- Configurar Pages si procede.
- Revisar archivos que no deben publicarse.
- Actualizar README y documentación.
- Etiquetar la primera versión.

---

## 9. Pruebas y criterios de aceptación

### Contenido

- [ ] Todo el Tema 1 está presente y navegable.
- [ ] Todo el Tema 2, parte 1, está presente y navegable.
- [ ] Los 59 ejemplos resueltos aparecen en su contexto.
- [ ] Las 27 soluciones del Tema 1 corresponden a sus enunciados.
- [ ] Existen exactamente 15 ejercicios E01–E15.
- [ ] Las 15 soluciones son independientes y completas.
- [ ] Fórmulas, tablas, figuras y unidades coinciden con los PDF.
- [ ] Ningún contenido se presenta como oficial si es material de repaso.

### Funcionalidad

- [ ] Las ocho prácticas calculan y validan correctamente.
- [ ] El progreso persiste al recargar.
- [ ] El buscador devuelve resultados útiles.
- [ ] Los enlaces internos y externos funcionan.
- [ ] El modo de impresión produce documentos legibles.
- [ ] El simulacro respeta la duración y el número de ejercicios.

### Calidad técnica

- [ ] `npm run build` finaliza sin errores.
- [ ] Las pruebas automatizadas pasan.
- [ ] No hay errores importantes de consola.
- [ ] La aplicación funciona sin conexión después de instalar dependencias.
- [ ] No hay desbordamientos graves en móvil.
- [ ] La navegación por teclado es posible.
- [ ] El repositorio no incluye credenciales ni archivos temporales.
- [ ] El README permite a otra persona ejecutar el proyecto desde cero.

---

## 10. Decisiones pendientes antes de publicar

- Confirmar si el repositorio de GitHub será privado o público.
- Confirmar si se distribuirán los PDF originales.
- Decidir si se usará GitHub Pages o solo ejecución local.
- Decidir si se publicará una licencia para el código propio.
- Incorporar la PEC/PED cuando se publique el enunciado oficial.
- Añadir los temas 3–10 a medida que la UNED los facilite.

---

## 11. Próximo paso

Comenzar por la Fase 1: crear el proyecto Vite/React/TypeScript, la navegación y la estructura de contenido, manteniendo el repositorio preparado para su primer envío a GitHub.
