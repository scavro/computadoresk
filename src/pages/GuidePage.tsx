import { Calculator, CalendarDays, CheckCircle2, FilePenLine } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

const plan = [
  ['1', 'Componentes básicos e interconexión', '10 h'],
  ['2', 'Unidad de memoria', '13 h'],
  ['3', 'Unidad de entrada/salida', '12 h'],
  ['4', 'Unidad central de procesamiento', '12 h'],
  ['5', 'Consideraciones generales de los SO', '10 h'],
  ['6', 'Descripción y control de procesos', '10 h'],
  ['7', 'Planificación de procesos', '10 h'],
  ['8', 'Administración de memoria', '13 h'],
  ['9', 'Gestión de entrada/salida', '10 h'],
  ['10', 'Gestión de archivos', '10 h'],
];

export function GuidePage() {
  return (
    <div className="page-shell guide-page">
      <PageHeader title="Guía de la asignatura" description="Fundamentos de Computadores (7103104-) · Primer curso · Primer semestre · 6 ECTS · 150 horas." aside={<span className="collection-stamp">6<br /><small>ECTS</small></span>} />
      <section className="evaluation-grid">
        <article className="evaluation-main"><FilePenLine /><h2>Prueba presencial</h2><strong className="big-grade">90<span>%</span></strong><p>Examen de desarrollo de 2 horas. La guía indica 5 preguntas, con un margen variable de 4 a 6 ejercicios.</p><ul><li>Sin apuntes ni libros</li><li>Desarrollo y justificación obligatorios</li><li>El resultado final por sí solo no es suficiente</li></ul></article>
        <article className="evaluation-secondary"><CalendarDays /><h2>PEC / PED</h2><strong className="big-grade">10<span>%</span></strong><p>Entrega prevista en diciembre. El enunciado se publicará en el curso virtual.</p><p>No es obligatoria, pero aporta hasta un punto a la calificación final.</p></article>
        <article className="evaluation-formula"><h2>Nota final</h2><div className="grade-formula">0,90 × examen <span>+</span> 0,10 × PEC</div><p><CheckCircle2 size={18} /> Sin PEC necesitas al menos un <strong>5,6</strong> en el examen y la nota final máxima es 9.</p></article>
        <article className="allowed-material"><Calculator /><div><h2>Material permitido</h2><p>Únicamente una calculadora no programable. El banco de esta web está pensado para practicar el desarrollo, no como cuestionario de opción múltiple.</p></div></article>
      </section>
      <section className="work-plan"><div className="section-heading"><div><h2>Plan de trabajo orientativo</h2><p>Diez semanas de teoría, más PEC, tutorías y preparación.</p></div></div><div className="plan-table" role="table" aria-label="Plan de trabajo"><div className="plan-row plan-header" role="row"><span>Semana</span><span>Contenido</span><span>Dedicación</span></div>{plan.map(([week, title, hours]) => <div className="plan-row" role="row" key={week}><span>{week.padStart(2, '0')}</span><strong>{title}</strong><span>{hours}</span></div>)}</div></section>
    </div>
  );
}
