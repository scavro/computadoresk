# Revisión del proyecto — estado

Fecha: 26/10/2026
Alcance: revisión completa del proyecto en busca de fallos (lógica, estilos, extracción de contenido, accesibilidad, persistencia) + verificación automática.

## Verificación automática (última ejecpción)

| Comando | Resultado |
| --- | --- |
| `npm run lint` | ✅ 0 errores, 3 avisos conocidos (ver "Pendientes") |
| `npm run test` | ✅ 17/17 tests en `src/practices/logic.test.ts` |
| `npm run build` | ✅ `tsc -b && vite build` sin errores |
| `npm run content:extract` | ✅ 24 secciones (T1), 21 (T2), 27 ejercicios, 48+11 ejemplos, 87+72 bloques |
| `npm run smoke` | ✅ 13 rutas + tema claro/oscuro + búsqueda + móvil 390px; sin errores de consola ni overflow |

## Fallos encontrados y corregidos

### Crítico

1. **Tema claro sin colores: variables CSS auto-referenciadas** — `src/styles/global.css`.
   `:root` contenía `--navy: var(--navy)` (y lo mismo con `--paper`, `--ink`, etc.): el valor era inválido en el tema claro y gran parte de la interfaz perdía colores. `--red` dependía de `--accent`, que solo existía en el tema oscuro.
   **Corregido:** se definieron todos los valores reales del tema claro (paleta del "Álbum de laboratorio" de DESIGN.md) y `--accent`/`--accent-dark` ahora existen en ambos temas.

2. **Cabecera fija con fondo opaco heredado del tema claro** — `src/styles/global.css`.
   Usaba `background: rgb(242 237 223 / 97%)` en claro, y en oscuro quedaba un fondo papel fijo.
   **Corregido:** `background: color-mix(in srgb, var(--paper) 97%, transparent)`.

### Alto

3. **Complemento a 2 con parte fraccionaria daba negativos** — `src/practices/logic.ts` (`fixedTwos`).
   `scaled % (2 ** n)` devuelve resto negativo en JS: `-12.375` (10 bits, 4 fracc.) producía `0-11000110`.
   **Corregido:** módulo positivo `((scaled % m) + m) % m`. Rango también corregido: era `±2^(n-1)` en vez de `±2^(n-1)/2^frac` (ahora `-32 … 31.9375` para 10 bits/4 fracc.).

4. **Exceso a 2^(n-1) implementado como C2** — `src/practices/logic.ts`.
   La práctica de enteros hacía `twosComplement(v + 2^(n-1), n)`, que recorta el bit extra y rechaza valores válidos.
   **Corregido:** nueva función `excessM(n, bits, m = 2^(bits-1))` que suma el exceso y codifica sin signo. Validación de límites (`0 … 2^n-1`).

5. **Conversión binario → decimal ignoraba la parte fraccionaria** — `src/practices/PracticeLab.tsx`.
   Usaba `binIntToDec(binary.split('.')[0])`, descartando los bits tras el punto.
   **Corregido:** nueva función `binToDec()` en `logic.ts` que valida el formato y suma los pesos `2^-i`.

6. **Extracción de PDF perdía texto** — `scripts/extract-course.mjs`.
   - `statement` y `solution` hacían `.replace(/^.*?\n/, '')`, borrando la primera línea (el enunciado "Ejercicio 1…").
   - `totalPages` contaba las páginas vacías del `\f` final.
   **Corregido:** se conserva el texto completo y se filtran páginas vacías. Regenerado `public/content`.

### Medio

7. **Temporizador del simulacro no sobrevivía a la recarga ni pausaba bien** — `src/pages/ExamPage.tsx`.
   El tiempo restante se decrementaba 1/s en el estado; al pausar/recargar seguía "corriendo" o perdía exactitud.
   **Corregido:** `endsAt` (timestamp de fin) + recomputación cada segundo; pausa/reauda recalcula desde `endsAt`. Al iniciar/reiniciar se limpian las respuestas (antes podían arrastrarse de un simulacro anterior).

8. **Contador "0/27" de ejercicios incluía los del banco de examen** — `src/pages/ExercisesPage.tsx`.
   **Corregido:** se cuentan solo los ids `oficial:*`.

9. **Búsqueda no encontraba texto fuera de los primeros 180 caracteres** — `src/pages/SearchPage.tsx`.
   **Corregido:** cada resultado guarda `searchText` completo para el filtro y mantiene un recorte corto para mostrar.

10. **Enlaces de ancla dependían de que el contenido ya estuviera cargado** — `src/App.tsx`.
    El scroll a `#seccion` se hacía a los 50 ms con un solo intento; si el JSON tardaba más, el enlace no llegaba.
    **Corregido:** reintento cada 50 ms hasta 40 veces (2 s), con cancelación al cambiar de ruta.

11. **Sin enlace "saltar al contenido"** — `src/components/Header.tsx`, `src/App.tsx`, `src/styles/global.css`.
    **Corregido:** skip-link enfocable + `<main tabIndex={-1}>` y foco al navegar sin ancla.

12. **Estado de las prácticas perdido al recargar** — `src/practices/PracticeLab.tsx`.
    ~30 campos de entrada (bases, enteros, coma fija, multimedia, rendimiento, memoria, expansión, DDR) usaban `useState`.
    **Corregido:** todos persisten en `localStorage` (`fc-lab-*`) vía `useLocalStorage`.

13. **Tema no persistía si `localStorage` estaba bloqueado** — `src/context/ThemeContext.tsx`.
    **Corregido:** `try/catch` en lectura y escritura; el modo oscuro sigue funcionando sin persistencia.

14. **Validación laxa en las prácticas de enteros** — `src/practices/logic.ts`.
    `onesComplement`/`twosComplement`/`fixedUnsigned` aceptaban bits o valores no enteros y rangos mal calculados (C1 admitía -128, que no existe en C1).
    **Corregido:** validación explícita de enteros, mínimo de bits y rangos correctos.

15. **El buscador ignoraba la URL y no indexaba los 27 ejercicios** — `src/pages/SearchPage.tsx`.
    `#/buscar?q=complemento` cargaba vacío (la query vivía solo en `useState`), y los enunciados/soluciones oficiales no estaban en el índice.
    **Corregido:** query sincronizada con `useSearchParams` (deep-links compartibles), índice ampliado con los 27 ejercicios y sus soluciones, y enlace con el ancla real `#ejercicio-<id>` (antes apuntaba a un id inexistente). Verificado: `q=complemento` → 10 resultados.

## Pruebas añadidas (`src/practices/logic.test.ts`)

De 12 → 17 tests, cubriendo los fallos anteriores:
- `binToDec` con fraccionario y entradas inválidas.
- Límites de C1 (`-128` rechazado) y de C2.
- `excessM` en los tres casos extremos (`-128 → 00000000`, `0 → 10000000`, `127 → 11111111`).
- `fixedTwos` con negativos (`-12.375 → 1100111010`, `-1 → 11110000`) y rango escalado.
- `fixedUnsigned` rango/resolución (`127.96875`, `0.03125`).

## Pendiente / decisiones abiertas

1. **3 avisos de ESLint** (`react-refresh/only-export-components`) en `src/context/{Course,Progress,Theme}Context.tsx`.
   Son el patrón habitual de "provider + hook en el mismo archivo"; arreglarlos requiere separar cada hook en su propio fichero. Es cosmético (no afecta a producción).
2. **`npm audit`: 4 vulnerabilidades (2 críticas)** — todas en `tinypool`, dependencia de `vitest` (solo entorno de desarrollo; no entra en `dist/`).
   El fix requiere `npm audit fix --force` → `vitest@5` (cambio mayor). Recomiendo dejarlo así o probar la actualización en una rama.
3. **Aviso de deprecación en ESLint** durante el lint (aviso del propio ESLint, sin impacto).
4. ~~**Smoke test visual en navegador**~~ — **hecho**: se añadió `npm run smoke` (`scripts/smoke.mjs`, Playwright + Chrome del sistema) que sirve `dist/` y comprueba 13 rutas, tema claro/oscuro, búsqueda y overflow en 1280/390px. Repasos visuales puntuales (P07 3D, impresión) siguen siendo manuales.

## Cómo verificar desde cero

```bash
npm install
npm run content:extract   # requiere los PDF en public/fuentes/ (gitignored)
npm run lint && npm run test && npm run build
npm run smoke             # sirve dist/ y comprueba rutas, temas y responsive
npm run preview           # o bien, para revisar manualmente
```
