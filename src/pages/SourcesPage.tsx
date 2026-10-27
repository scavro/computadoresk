import { Download, FileText, LockKeyhole } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useCourse } from '../context/course';

const documents = [
  { id: 'tema-1', title: 'Apuntes del Tema 1', file: 'tema-1.pdf', pages: 92, description: 'Representación de la información y estructura básica de un computador.' },
  { id: 'tema-2', title: 'Apuntes del Tema 2 · Parte 1', file: 'tema-2.pdf', pages: 49, description: 'Unidad de memoria hasta módulos y DDR SDRAM.' },
  { id: 'ejercicios-1', title: 'Ejercicios del Tema 1', file: 'ejercicios-tema-1.pdf', description: 'Los 27 enunciados originales.' },
  { id: 'soluciones-1', title: 'Soluciones del Tema 1', file: 'soluciones-tema-1.pdf', description: 'Desarrollo oficial de los 27 ejercicios.' },
  { id: 'informacion', title: 'Información básica', file: 'informacion-basica.pdf', pages: 2, description: 'Temario, evaluación y material permitido.' },
  { id: 'guia', title: 'Guía docente 2026–2027', file: 'guia.pdf', pages: 12, description: 'Competencias, metodología, plan de trabajo y evaluación.' },
];

export function SourcesPage() {
  const { sources } = useCourse();
  const local = sources.length > 0;
  return (
    <div className="page-shell sources-page">
      <PageHeader title="Fuentes y procedencia" description="Cada colección distingue el material docente del repaso creado para esta web. Los apuntes conservan referencias a las páginas originales." />
      <div className="privacy-note"><LockKeyhole /><div><strong>Material íntegro solo en local</strong><p>Los documentos y su conversión completa no se suben al repositorio público. El código sí está disponible en GitHub.</p></div></div>
      <div className="source-list">{documents.map((document) => <article key={document.id}><FileText /><div><h2>{document.title}</h2><p>{document.description}</p><small>{document.pages ? `${document.pages} páginas · ` : ''}Documento PDF original</small></div>{local ? <a className="icon-button" href={`./fuentes/${document.file}`} target="_blank" rel="noreferrer" aria-label={`Abrir ${document.title}`}><Download /></a> : <span className="source-local-label">Solo local</span>}</article>)}</div>
      <section className="provenance-ledger"><h2>Qué contiene cada colección</h2><dl><div><dt>Apuntes y ejercicios del Tema 1</dt><dd>Material elaborado por el equipo docente de la UNED.</dd></div><div><dt>Banco E01–E15</dt><dd>Ejercicios originales de repaso creados para esta aplicación; no pertenecen a exámenes oficiales.</dd></div><div><dt>Prácticas P01–P08</dt><dd>Laboratorios interactivos de apoyo. No sustituyen a la PEC/PED.</dd></div></dl></section>
    </div>
  );
}
