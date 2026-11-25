import { BookOpen, Download, FileText } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useCourse } from '../context/course';
import type { SourceDocument } from '../types';

const fallbackDocuments: SourceDocument[] = [
  { id: 'portadas', title: 'Portadas del Bloque I', file: 'portadas.pdf', pages: 5, description: 'Portada general de la asignatura y portadillas editoriales de los Temas 1 a 4.' },
  { id: 'tema-1', title: 'Apuntes del Tema 1 (con portada)', file: 'tema-1.pdf', pages: 93, description: 'Representación de la información y estructura básica de un computador.' },
  { id: 'ejercicios-1', title: 'Ejercicios del Tema 1', file: 'ejercicios-tema-1.pdf', pages: 4, description: 'Los 27 enunciados propuestos del Tema 1.' },
  { id: 'soluciones-1', title: 'Soluciones del Tema 1', file: 'soluciones-tema-1.pdf', pages: 35, description: 'Desarrollo completo de los 27 ejercicios del Tema 1.' },
  { id: 'tema-2', title: 'Apuntes del Tema 2 completo (con portada)', file: 'tema-2.pdf', pages: 139, description: 'Unidad de memoria: conceptos, semiconductores, módulos DDR, caché, asociativa y secundaria.' },
  { id: 'ejercicios-2', title: 'Ejercicios del Tema 2', file: 'ejercicios-tema-2.pdf', pages: 12, description: 'Los 45 enunciados propuestos de la Unidad de memoria.' },
  { id: 'soluciones-2', title: 'Soluciones del Tema 2', file: 'soluciones-tema-2.pdf', pages: 69, description: 'Desarrollo completo de los 45 ejercicios del Tema 2.' },
  { id: 'ejercicios-cache-2', title: 'Problema y cuestionario extra de Memoria Caché (Tema 2)', file: 'ejercicios-cache-tema-2.pdf', pages: 5, description: 'Problema de caché asociativa por conjuntos (LRU vs FIFO) y 10 preguntas de autoevaluación.' },
  { id: 'tema-3', title: 'Apuntes del Tema 3 completo (con portada)', file: 'tema-3.pdf', pages: 83, description: 'Unidad de entrada/salida: controladores, E/S programada, interrupciones, DMA y GPU.' },
  { id: 'ejercicios-3', title: 'Ejercicios y autoevaluación del Tema 3', file: 'ejercicios-tema-3.pdf', pages: 6, description: '9 cuestiones de autoevaluación y 9 problemas de Entrada/Salida.' },
  { id: 'soluciones-3', title: 'Soluciones del Tema 3', file: 'soluciones-tema-3.pdf', pages: 14, description: 'Soluciones razonadas de las 18 actividades del Tema 3.' },
  { id: 'tema-4', title: 'Apuntes del Tema 4 completo (con portada)', file: 'tema-4.pdf', pages: 93, description: 'Unidad central de procesamiento: puertas, ALU, repertorios, ruta de datos, segmentación y GPUs/NPUs.' },
  { id: 'informacion', title: 'Información básica 2026–2027', file: 'informacion-basica.pdf', pages: 2, description: 'Temario oficial de 10 temas, evaluación y normas del examen presencial.' },
  { id: 'guia', title: 'Guía docente completa 2026–2027', file: 'guia.pdf', pages: 12, description: 'Equipo docente, competencias, plan de trabajo de 150 horas y bibliografía.' },
];

export function SourcesPage() {
  const { sources } = useCourse();
  const docs = sources.length > 0 ? sources : fallbackDocuments;

  return (
    <div className="page-shell sources-page">
      <PageHeader title="Fuentes y procedencia" description="Cada colección distingue el material docente original del repaso creado para esta web. Los PDFs de los cuatro temas incluyen su portada encuadernada y referencias de página." />
      <div className="privacy-note"><BookOpen /><div><strong>Material docente disponible</strong><p>Los documentos originales se publican como apoyo al estudio personal de la asignatura. Los apuntes elaborados por el equipo docente de la UNED pertenecen a sus autores (J. M. Díaz Martínez, R. Muñoz Mansilla y D. Chaos García).</p></div></div>
      <div className="source-list">
        {docs.map((document) => (
          <article key={document.id}>
            <FileText />
            <div>
              <h2>{document.title}</h2>
              <p>{document.description}</p>
              <small>{document.pages ? `${document.pages} páginas · ` : ''}Documento PDF</small>
            </div>
            <a className="icon-button" href={`./fuentes/${document.file}`} target="_blank" rel="noreferrer" aria-label={`Abrir ${document.title}`}>
              <Download />
            </a>
          </article>
        ))}
      </div>
      <section className="provenance-ledger">
        <h2>Qué contiene cada colección</h2>
        <dl>
          <div><dt>Apuntes de los Temas 1 a 4 y ejercicios T1–T3</dt><dd>Material elaborado por el equipo docente de la UNED, con portadas encuadernadas al inicio de cada tema y solución desarrollada en la web para el documento adicional de caché.</dd></div>
          <div><dt>Banco tipo examen E01–E25</dt><dd>Veinticinco problemas originales de desarrollo creados para esta aplicación; no pertenecen a exámenes oficiales.</dd></div>
          <div><dt>Prácticas P01–P12</dt><dd>Laboratorios interactivos 2D (SVG + GSAP) y 3D (Three.js) de apoyo al estudio. No sustituyen a la PEC/PED.</dd></div>
        </dl>
      </section>
    </div>
  );
}
