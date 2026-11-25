import { readFile, access } from 'node:fs/promises';

async function json(name) {
  return JSON.parse(await readFile(new URL(`../public/content/${name}.json`, import.meta.url), 'utf8'));
}

const [topic1, topic2, topic3, topic4, ex1, ex2, ex3, sources] = await Promise.all([
  json('topic-1'),
  json('topic-2'),
  json('topic-3'),
  json('topic-4'),
  json('exercises-1'),
  json('exercises-2'),
  json('exercises-3'),
  json('sources'),
]);

for (const [name, items] of [
  ['Tema 1', topic1.sections],
  ['Tema 2', topic2.sections],
  ['Tema 3', topic3.sections],
  ['Tema 4', topic4.sections],
  ['Ejercicios Tema 1', ex1.exercises],
  ['Ejercicios Tema 2', ex2.exercises],
  ['Cuestionario Caché Tema 2', ex2.quiz],
  ['Ejercicios Tema 3', ex3.exercises],
  ['Fuentes', sources.documents],
]) {
  if (!Array.isArray(items) || items.length === 0) throw new Error(`${name}: contenido ausente o vacío`);
}

if (ex1.exercises.length !== 27) throw new Error(`Tema 1: se esperaban 27 ejercicios, hay ${ex1.exercises.length}`);
if (ex2.exercises.length !== 46) throw new Error(`Tema 2: se esperaban 46 ejercicios (45 + extra caché), hay ${ex2.exercises.length}`);
if (ex2.quiz.length !== 10) throw new Error(`Tema 2: se esperaban 10 preguntas de test de caché, hay ${ex2.quiz.length}`);
if (ex3.exercises.length !== 18) throw new Error(`Tema 3: se esperaban 18 ejercicios, hay ${ex3.exercises.length}`);

for (const { file } of sources.documents) {
  if (typeof file !== 'string' || !/^[\w-]+\.pdf$/.test(file)) throw new Error(`Nombre de fuente inválido: ${file}`);
  const pdf = await readFile(new URL(`../public/fuentes/${file}`, import.meta.url));
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error(`PDF inválido: ${file}`);
}

for (const cover of ['portada-general', 'portada-tema-1', 'portada-tema-2', 'portada-tema-3', 'portada-tema-4']) {
  await access(new URL(`../public/covers/${cover}.webp`, import.meta.url));
}

let figCount = 0;
for (const topic of [topic1, topic2, topic3, topic4]) {
  for (const section of topic.sections) {
    for (const block of section.blocks) {
      if (block.type === 'figure' && block.src) {
        const rel = block.src.replace(/^\.\//, '');
        await access(new URL(`../public/${rel}`, import.meta.url));
        figCount += 1;
      }
    }
  }
}

console.log(
  `Contenido verificado: T1(${topic1.sections.length} secc., ${ex1.exercises.length} ej.), ` +
  `T2(${topic2.sections.length} secc., ${ex2.exercises.length} ej. + ${ex2.quiz.length} test), ` +
  `T3(${topic3.sections.length} secc., ${ex3.exercises.length} ej.), ` +
  `T4(${topic4.sections.length} secc.), ${figCount} figuras y ${sources.documents.length} PDFs.`
);
