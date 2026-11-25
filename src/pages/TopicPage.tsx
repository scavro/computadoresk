import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Circle, ExternalLink, FileDown, Printer, Search } from 'lucide-react';
import { useCourse } from '../context/course';
import { useProgress } from '../context/progress';
import { topicMeta } from '../data/course';
import { CourseBlocks } from '../components/CourseBlocks';
import { EmptyState, LoadingState } from '../components/EmptyState';

export function TopicPage() {
  const { topicId = '1' } = useParams();
  const id = Number(topicId);
  const meta = topicMeta.find((topic) => topic.id === id);
  const { topics, loading } = useCourse();
  const topic = topics[id];
  const { readSections, toggle } = useProgress();
  const [query, setQuery] = useState('');
  const [indexOpen, setIndexOpen] = useState(true);

  const sections = useMemo(() => {
    if (!topic) return [];
    const normalized = query.trim().toLocaleLowerCase('es');
    if (!normalized) return topic.sections;
    return topic.sections.filter((section) => `${section.number} ${section.title} ${JSON.stringify(section.blocks)}`.toLocaleLowerCase('es').includes(normalized));
  }, [topic, query]);

  if (!meta) return <EmptyState title="Este tema todavía no está disponible"><p>Los temas del Bloque II (Sistemas Operativos) se publicarán progresivamente.</p><Link className="text-link" to="/">Volver al álbum</Link></EmptyState>;
  if (loading) return <LoadingState />;
  if (!topic) return <EmptyState><p>El contenido del tema no está disponible en este momento. Comprueba tu conexión y vuelve a intentarlo.</p><Link className="text-link" to="/fuentes">Ver información sobre las fuentes</Link></EmptyState>;

  const currentIndex = topicMeta.findIndex((item) => item.id === id);
  const prev = topicMeta[currentIndex - 1];
  const next = topicMeta[currentIndex + 1];
  const figCount = topic.sections.reduce((acc, s) => acc + s.blocks.filter((b) => b.type === 'figure').length, 0);

  return (
    <div className="reader-layout">
      <aside className={indexOpen ? 'reader-index is-open' : 'reader-index'}>
        <div className="reader-index-heading"><BookOpen size={18} /><strong>Índice del tema</strong></div>
        <div className="topic-switcher topic-switcher-4" aria-label="Cambiar de tema">
          {topicMeta.map((item) => <Link key={item.id} className={item.id === id ? 'active' : ''} to={`/temas/${item.id}`}>T{item.id}</Link>)}
        </div>
        <nav>
          {topic.sections.map((section) => (
            <a key={section.id} href={`#/temas/${id}#${section.id}`} className={readSections.includes(`${id}:${section.id}`) ? 'is-read' : ''}>
              <span>{section.number}</span>{section.title}
            </a>
          ))}
        </nav>
      </aside>

      <div className="reader-main">
        <div className="reader-toolbar">
          <button className="button button-quiet index-toggle" onClick={() => setIndexOpen(!indexOpen)}>{indexOpen ? 'Ocultar índice' : 'Mostrar índice'}</button>
          <label className="inline-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar dentro del tema" aria-label="Buscar dentro del tema" /></label>
          <button className="icon-button" onClick={() => window.print()} title="Imprimir tema" aria-label="Imprimir tema"><Printer size={19} /></button>
        </div>

        <header className="topic-title topic-title-with-cover">
          <div>
            <Link to="/" className="back-link"><ArrowLeft size={16} /> Álbum del curso</Link>
            <span className="topic-number">Bloque I · Tema {id} completo</span>
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>
            <div className="source-line">
              Material de la UNED · {topic.totalPages || meta.pages} páginas · {meta.examples} ejemplos · {figCount} figuras
            </div>
            <div className="topic-header-actions">
              <a className="button button-secondary" href={`./fuentes/tema-${id}.pdf`} target="_blank" rel="noreferrer">
                <FileDown size={17} /> Abrir PDF con portada
              </a>
              {meta.exercises > 0 && (
                <Link className="button button-primary" to={`/ejercicios/tema-${id}`}>
                  Resolver {meta.exercises} ejercicios <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </div>
          <a className="topic-cover-preview" href={`./fuentes/tema-${id}.pdf`} target="_blank" rel="noreferrer" title={`Abrir PDF encuadernado del Tema ${id}`}>
            <img src={meta.cover} alt={`Portada del Tema ${id}`} />
          </a>
        </header>

        {sections.length === 0 && <EmptyState title="Sin coincidencias"><p>Prueba con otro término o borra la búsqueda.</p><button className="button button-secondary" onClick={() => setQuery('')}>Limpiar búsqueda</button></EmptyState>}

        <div className="topic-sections">
          {sections.map((section) => {
            const progressId = `${id}:${section.id}`;
            const isRead = readSections.includes(progressId);
            const targetPdfPage = section.pdfPage ?? section.page;
            return (
              <section className="reading-sheet" id={section.id} key={section.id}>
                <div className="reading-sheet-top">
                  <span>{section.number}</span>
                  <a href={`./fuentes/tema-${id}.pdf#page=${targetPdfPage}`} target="_blank" rel="noreferrer">PDF · pág. {section.page}<ExternalLink size={13} /></a>
                </div>
                <h2>{section.title}</h2>
                <CourseBlocks blocks={section.blocks} />
                <button className={isRead ? 'read-toggle is-read' : 'read-toggle'} onClick={() => toggle('readSections', progressId)}>
                  {isRead ? <CheckCircle2 size={18} /> : <Circle size={18} />}{isRead ? 'Sección leída' : 'Marcar como leída'}
                </button>
              </section>
            );
          })}
        </div>

        <nav className="topic-pagination" aria-label="Cambiar de tema">
          {prev ? (
            <Link to={`/temas/${prev.id}`}><ArrowLeft /><span><small>Tema anterior</small><strong>Tema {prev.id} · {prev.shortTitle}</strong></span></Link>
          ) : <span />}
          {meta.exercises > 0 && (
            <Link to={`/ejercicios/tema-${id}`}><Check size={18} /><span><small>Después de estudiar</small><strong>Ejercicios del Tema {id}</strong></span><ArrowRight /></Link>
          )}
          {next ? (
            <Link to={`/temas/${next.id}`}><span><small>Siguiente tema</small><strong>Tema {next.id} · {next.shortTitle}</strong></span><ArrowRight /></Link>
          ) : (
            <Link to="/practicas/cpu-pipeline"><span><small>Aplica lo aprendido</small><strong>Laboratorio de CPU y Pipeline</strong></span><ArrowRight /></Link>
          )}
        </nav>
      </div>
    </div>
  );
}
