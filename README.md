# Fundamentos de Computadores

Web local de estudio para la asignatura **Fundamentos de Computadores (7103104-)** del Grado en Ingeniería en Inteligencia Artificial de la UNED.

El proyecto se encuentra en fase de planificación. La aplicación todavía no está implementada.

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

Cuando la aplicación esté implementada:

```bash
npm install
npm run dev
```

La dirección local aparecerá en la terminal, normalmente `http://localhost:5173`.

## Comandos previstos

```bash
npm run dev      # Servidor local
npm run build    # Compilación de producción
npm run preview  # Vista previa de la compilación
npm run test     # Pruebas
npm run lint     # Comprobaciones de código
```

## Estructura

La estructura definitiva se documentará al implementar la Fase 1. El contenido de los apuntes estará separado de los componentes de interfaz para facilitar la incorporación de futuros temas.

## Material docente

Los apuntes, ejercicios y soluciones originales pertenecen a sus autores y a la UNED. Este repositorio debe mantenerse **privado** salvo que se cuente con autorización para redistribuir ese material. Consulta la sección de GitHub de [PLAN.md](PLAN.md).

## Estado

- [x] Planificación inicial.
- [x] Repositorio Git preparado.
- [ ] Fase 1: base de la aplicación.
- [ ] Fase 2: apuntes.
- [ ] Fase 3: ejercicios existentes.
- [ ] Fase 4: banco de examen.
- [ ] Fase 5: prácticas interactivas.
- [ ] Fase 6: pruebas y accesibilidad.
- [ ] Fase 7: publicación.

## Publicación en GitHub

El repositorio está preparado localmente en la rama `main`. Para asociarlo a un repositorio remoto:

```bash
git remote add origin git@github.com:USUARIO/fundamentos-computadores.git
git push -u origin main
```

Sustituye `USUARIO` por la cuenta correspondiente. Se recomienda crear primero el repositorio como privado.
