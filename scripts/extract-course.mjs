import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(process.cwd(), '..');
const OUT = path.join(process.cwd(), 'public', 'content');
const SRC = path.join(process.cwd(), 'public', 'fuentes');

const files = {
  topic1: 'apuntes_FC_Tema01_completo_v3.pdf',
  topic2: 'apuntes_FC_Tema02_parte1.pdf',
  exercises: 'FC_Tema1_ ejercicios.pdf',
  solutions: 'FC_Tema1_ soluciones.pdf',
  basic: 'FC_información_básica.pdf',
  guide: '7103104-_2027.pdf',
};

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(SRC, { recursive: true });

function pdfText(fileName, layout = true) {
  return execFileSync('pdftotext', [layout ? '-layout' : '-raw', path.join(ROOT, fileName), '-'], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
}

function cleanLines(text) {
  return text.split(/\n/).map((line) => line.replace(/\s+$/g, '')).filter((line) => {
    if (/^Apuntes de Fundamentos de Computadores\s+J\. M\./.test(line)) return false;
    if (/^\s*\d+\s+Apuntes de Fundamentos de Computadores/.test(line)) return false;
    if (/^\s*Capítulo \d+:/i.test(line)) return false;
    return true;
  });
}

function joinHyphens(text) {
  return text.replace(/([a-záéíóúñ])-\n(\s*[a-záéíóúñ])/gi, '$1$2');
}

function pages(text) {
  return joinHyphens(text).split('\f').map((page) => page.replace(/\n{3,}/g, '\n\n').trim());
}

function isHeading(line, topic) {
  const match = line.match(/^(\d+\.\d+(?:\.\d+)?\.?)\s+(.+)$/);
  if (!match) return null;
  if (!match[1].startsWith(`${topic}.`)) return null;
  if (match[2].length > 130) return null;
  return { number: match[1], title: match[2].trim() };
}

function blockType(line) {
  const trimmed = line.trim();
  if (/^▷\s*Nota/.test(trimmed)) return 'note';
  if (/^?\s*Ejemplo\s+\d+\.\d+/.test(trimmed)) return 'example';
  if (/^Figura\s+\d+\.\d+/.test(trimmed) || /^Tabla\s+\d+\.\d+/.test(trimmed)) return 'caption';
  if (/^\s*$/.test(trimmed)) return 'paragraph';
  return 'paragraph';
}

function parseTopic(fileName, topicNumber, skipPages = 2) {
  const pageList = pages(pdfText(fileName));
  const sections = [];
  let current = null;
  let buffer = [];
  let pageNumber = 0;

  function flushBuffer() {
    if (!current) return;
    const text = buffer.join('\n').trim();
    if (!text) return;
    const type = text.startsWith('▷') ? 'note' : text.startsWith('Ejemplo') ? 'example' : text.startsWith('Figura') || text.startsWith('Tabla') ? 'caption' : 'paragraph';
    current.blocks.push({ type, text });
    buffer = [];
  }

  for (let i = skipPages; i < pageList.length; i++) {
    pageNumber = i + 1;
    const page = pageList[i];
    if (!page) continue;
    for (const line of page.split('\n')) {
      const heading = isHeading(line, topicNumber);
      if (heading) {
        flushBuffer();
        if (current) sections.push(current);
        current = { id: `s-${topicNumber}-${heading.number.replace(/\./g, '-')}`, number: heading.number, title: heading.title, page: pageNumber, blocks: [] };
      } else if (current) {
        if (line.trim() === '') {
          flushBuffer();
        } else {
          buffer.push(line);
        }
      }
    }
    flushBuffer();
  }
  if (current) sections.push(current);

  // Merge adjacent paragraphs; keep examples/notes/captions separate.
  const merged = sections.map((section) => {
    const blocks = [];
    let para = [];
    for (const block of section.blocks) {
      if (block.type === 'paragraph' && !block.text.startsWith('▷')) {
        para.push(block.text);
      } else {
        if (para.length) {
          blocks.push({ type: 'paragraph', text: para.join('\n\n') });
          para = [];
        }
        blocks.push(block);
      }
    }
    if (para.length) blocks.push({ type: 'paragraph', text: para.join('\n\n') });
    return { ...section, blocks };
  });

  return {
    id: topicNumber,
    title: topicNumber === 1 ? 'Representación de la información y estructura básica de un computador' : 'Unidad de memoria',
    subtitle: topicNumber === 2 ? 'Parte 1 disponible' : undefined,
    source: files[`topic${topicNumber}`],
    totalPages: pageList.filter(Boolean).length,
    sections: merged,
  };
}

function splitChunks(text, regex) {
  const matches = [...text.matchAll(regex)];
  const chunks = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    chunks.push({ key: matches[i][1], text: text.slice(start, end).trim() });
  }
  return chunks;
}

function parseExercises() {
  const text = joinHyphens(pdfText(files.exercises));
  const regex = /^\s*(1\.\d+)\.?\s+[A-ZÁÉÍÓÚÑ(]/mg;
  const chunks = splitChunks(text, regex).filter((chunk) => !chunk.text.includes('Ejercicios propuestos'));
  const solutionsText = joinHyphens(pdfText(files.solutions));
  const solutionChunks = splitChunks(solutionsText, regex);
  const solutionMap = new Map(solutionChunks.map((chunk) => [chunk.key, chunk.text]));
  return chunks.map((chunk) => ({
    id: chunk.key,
    number: chunk.key,
    statement: [{ type: 'paragraph', text: chunk.text.trim() }],
    solution: [{ type: 'paragraph', text: (solutionMap.get(chunk.key) || '').trim() }],
  }));
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2), 'utf8');
}

const topic1 = parseTopic(files.topic1, 1, 2);
const topic2 = parseTopic(files.topic2, 2, 2);
const exercises = parseExercises();

writeJson('topic-1.json', topic1);
writeJson('topic-2.json', topic2);
writeJson('exercises-1.json', { topic: 1, exercises });
writeJson('sources.json', {
  documents: [
    { id: 'tema-1', title: 'Apuntes del Tema 1', file: 'tema-1.pdf', pages: 92, description: 'Representación de la información y estructura básica de un computador.' },
    { id: 'tema-2', title: 'Apuntes del Tema 2 · Parte 1', file: 'tema-2.pdf', pages: 49, description: 'Unidad de memoria hasta módulos y DDR SDRAM.' },
    { id: 'ejercicios-1', title: 'Ejercicios del Tema 1', file: 'ejercicios-tema-1.pdf', description: 'Los 27 enunciados originales.' },
    { id: 'soluciones-1', title: 'Soluciones del Tema 1', file: 'soluciones-tema-1.pdf', description: 'Desarrollo oficial de los 27 ejercicios.' },
    { id: 'informacion', title: 'Información básica', file: 'informacion-basica.pdf', pages: 2, description: 'Temario, evaluación y material permitido.' },
    { id: 'guia', title: 'Guía docente 2026–2027', file: 'guia.pdf', pages: 12, description: 'Competencias, metodología, plan de trabajo y evaluación.' },
  ],
});

for (const [key, value] of Object.entries(files)) {
  const target = {
    topic1: 'tema-1.pdf',
    topic2: 'tema-2.pdf',
    exercises: 'ejercicios-tema-1.pdf',
    solutions: 'soluciones-tema-1.pdf',
    basic: 'informacion-basica.pdf',
    guide: 'guia.pdf',
  }[key];
  if (target) fs.copyFileSync(path.join(ROOT, value), path.join(SRC, target));
}

const example1 = (topic1.sections.flatMap((s) => s.blocks.map((b) => b.text)).join('\n').match(/Ejemplo\s+1\.\d+/g) || []).length;
const example2 = (topic2.sections.flatMap((s) => s.blocks.map((b) => b.text)).join('\n').match(/Ejemplo\s+2\.\d+/g) || []).length;

console.log(`Secciones tema 1: ${topic1.sections.length}`);
console.log(`Secciones tema 2: ${topic2.sections.length}`);
console.log(`Ejercicios: ${exercises.length}`);
console.log(`Ejemplos detectados tema 1: ${example1}; tema 2: ${example2}`);
console.log(`Bloques tema 1: ${topic1.sections.reduce((a, s) => a + s.blocks.length, 0)}`);
console.log(`Bloques tema 2: ${topic2.sections.reduce((a, s) => a + s.blocks.length, 0)}`);
if (exercises.length !== 27) throw new Error(`Se esperaban 27 ejercicios, hay ${exercises.length}`);
if (example1 < 48) throw new Error(`Ejemplos tema 1 incompletos: ${example1}`);
if (example2 < 11) throw new Error(`Ejemplos tema 2 incompletos: ${example2}`);
console.log('Extracción completada.');
