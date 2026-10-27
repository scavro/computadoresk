import { readFile } from 'node:fs/promises';

async function json(name) {
  return JSON.parse(await readFile(new URL(`../public/content/${name}.json`, import.meta.url), 'utf8'));
}

const [topic1, topic2, exercises, sources] = await Promise.all([
  json('topic-1'), json('topic-2'), json('exercises-1'), json('sources'),
]);

for (const [name, items] of [
  ['Tema 1', topic1.sections],
  ['Tema 2', topic2.sections],
  ['Ejercicios', exercises.exercises],
  ['Fuentes', sources.documents],
]) {
  if (!Array.isArray(items) || items.length === 0) throw new Error(`${name}: contenido ausente o vacío`);
}
if (exercises.exercises.length !== 27) throw new Error('Se esperaban 27 ejercicios oficiales');
for (const { file } of sources.documents) {
  if (typeof file !== 'string' || !/^[\w-]+\.pdf$/.test(file)) throw new Error(`Nombre de fuente inválido: ${file}`);
  const pdf = await readFile(new URL(`../public/fuentes/${file}`, import.meta.url));
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error(`PDF inválido: ${file}`);
}
console.log(`Contenido verificado: ${topic1.sections.length} secciones del Tema 1, ${topic2.sections.length} del Tema 2, ${exercises.exercises.length} ejercicios y ${sources.documents.length} PDF.`);
