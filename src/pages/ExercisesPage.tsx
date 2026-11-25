import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Eye, EyeOff, FlaskConical, Printer, Search } from 'lucide-react';
import { useCourse } from '../context/course';
import { useProgress } from '../context/progress';
import { topicMeta } from '../data/course';
import { CourseBlocks } from '../components/CourseBlocks';
import { EmptyState, LoadingState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function ExercisesPage({ solutions }: { solutions: boolean }) {
  const { topicSlug = 'tema-1' } = useParams();
  const match = topicSlug.match(/^tema-(\d+)$/);
  const topicNum = match ? Number(match[1]) : 1;
  const meta = topicMeta.find((t) => t.id === topicNum) ?? topicMeta[0];

  const { exercisesByTopic, loading } = useCourse();
  const doc = exercisesByTopic[topicNum] ?? null;
  const { completedExercises, toggle } = useProgress();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState<string[]>([]);
  const [quizChoices, setQuizChoices] = useLocalStorage<Record<string, number>>('fc-cache-quiz-v1', {});

  const filtered = useMemo(
    () => doc?.exercises.filter((exercise) => `${exercise.id} ${exercise.number} ${JSON.stringify(exercise.statement)}`.toLowerCase().includes(query.toLowerCase())) ?? [],
    [doc, query],
  );

  if (loading) return <LoadingState />;

  const topicPrefix = `oficial:${topicNum}.`;
  const completedInTopic = doc
    ? doc.exercises.filter((ex) => completedExercises.includes(`oficial:${ex.id}`)).length
    : completedExercises.filter((id) => id.startsWith(topicPrefix)).length;

  if (topicNum === 4) {
    return (
      <div className="page-shell exercises-page">
        <Link className="back-link" to="/temas/4"><ArrowLeft size={16} /> Volver al Tema 4</Link>
        <div className="topic-tabs" aria-label="Seleccionar tema de ejercicios">
          {topicMeta.map((t) => (
            <Link key={t.id} className={t.id === topicNum ? 'active' : ''} to={`/ejercicios/tema-${t.id}`}>
              Tema {t.id} {t.exercises > 0 ? `(${t.exercises})` : '(Banco)'}
            </Link>
          ))}
        </div>
        <EmptyState title="Ejercicios oficiales del Tema 4 aún no publicados">
          <p>El equipo docente aún no ha publicado el cuaderno separado de ejercicios del Tema 4. Puedes practicar ya mismo con los problemas nuevos del Tema 4 en el banco de examen y con el simulador de segmentación.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="button button-primary" to="/examen/ejercicios">Ir al banco de examen (Tema 4)</Link>
            <Link className="button button-secondary" to="/practicas/cpu-pipeline">Abrir laboratorio de CPU</Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  if (!doc) {
    return (
      <EmptyState>
        <p>Los ejercicios oficiales de este tema no están disponibles en este momento.</p>
        <Link className="text-link" to="/examen/ejercicios">Abrir el banco de repaso</Link>
      </EmptyState>
    );
  }

  const totalCount = doc.exercises.length;
  const quiz = doc.quiz ?? [];
  const quizAnswered = quiz.filter((q) => quizChoices[q.id] !== undefined).length;
  const quizScore = quiz.filter((q) => quizChoices[q.id] === q.correct).length;

  return (
    <div className="page-shell exercises-page">
      <Link className="back-link" to={solutions ? `/ejercicios/tema-${topicNum}` : `/temas/${topicNum}`}>
        <ArrowLeft size={16} />{solutions ? 'Volver a los enunciados' : `Volver al Tema ${topicNum}`}
      </Link>

      <div className="topic-tabs" aria-label="Seleccionar tema de ejercicios">
        {topicMeta.map((t) => (
          <Link key={t.id} className={t.id === topicNum ? 'active' : ''} to={solutions && t.exercises > 0 ? `/ejercicios/tema-${t.id}/soluciones` : `/ejercicios/tema-${t.id}`}>
            Tema {t.id} {t.exercises > 0 ? `(${t.exercises})` : '(Banco)'}
          </Link>
        ))}
      </div>

      <PageHeader
        title={solutions ? `Soluciones del Tema ${topicNum}` : `Ejercicios del Tema ${topicNum}`}
        description={
          solutions
            ? `Desarrollo completo de los ${totalCount} ejercicios de ${meta.shortTitle}. Contrasta el procedimiento después de intentar cada problema.`
            : `${totalCount} ejercicios de ${meta.shortTitle}${quiz.length ? ` más ${quiz.length} cuestiones interactivas sobre memoria caché` : ''}. Las soluciones están separadas para practicar sin pistas.`
        }
        aside={<span className="collection-stamp">{completedInTopic} / {totalCount}<br /><small>completados</small></span>}
      />

      <div className="exercise-toolbar">
        <div className="segmented-control">
          <Link className={!solutions ? 'active' : ''} to={`/ejercicios/tema-${topicNum}`}>Enunciados</Link>
          <Link className={solutions ? 'active' : ''} to={`/ejercicios/tema-${topicNum}/soluciones`}>Soluciones</Link>
        </div>
        {quiz.length > 0 && !solutions && (
          <a className="button button-quiet" href={`#/ejercicios/tema-${topicNum}#cuestionario-cache`}>
            Test caché ({quizScore}/{quiz.length})
          </a>
        )}
        <label className="inline-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Número o contenido" aria-label="Buscar ejercicio" /></label>
        <button className="icon-button" onClick={() => window.print()} aria-label="Imprimir ejercicios"><Printer size={19} /></button>
      </div>

      <div className="exercise-list">
        {filtered.map((exercise) => {
          const key = `oficial:${exercise.id}`;
          const done = completedExercises.includes(key);
          const showSolution = visible.includes(exercise.id);
          return (
            <article className="exercise-sheet" key={exercise.id} id={`ejercicio-${exercise.id}`}>
              <header>
                <span className="exercise-number">{exercise.number}</span>
                <span className="origin-label">{exercise.origin ?? 'Material UNED'}</span>
              </header>
              <CourseBlocks blocks={solutions ? exercise.solution : exercise.statement} />
              <footer>
                <button className={done ? 'read-toggle is-read' : 'read-toggle'} onClick={() => toggle('completedExercises', key)}>
                  {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}{done ? 'Completado' : 'Marcar como completado'}
                </button>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                  {exercise.id === '2.46' && (
                    <Link className="text-link" to="/practicas/cache"><FlaskConical size={15} /> Simular en caché</Link>
                  )}
                  {solutions ? (
                    <button className="text-button" onClick={() => setVisible((current) => showSolution ? current.filter((id) => id !== exercise.id) : [...current, exercise.id])}>
                      {showSolution ? <EyeOff size={17} /> : <Eye size={17} />}{showSolution ? 'Ocultar enunciado' : 'Ver enunciado'}
                    </button>
                  ) : (
                    <Link className="text-link" to={`/ejercicios/tema-${topicNum}/soluciones#ejercicio-${exercise.id}`}>
                      Ver solución <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </footer>
              {solutions && showSolution && (
                <details open className="statement-reveal">
                  <summary>Enunciado {exercise.number}</summary>
                  <CourseBlocks blocks={exercise.statement} />
                </details>
              )}
            </article>
          );
        })}
      </div>

      {quiz.length > 0 && !solutions && (
        <section className="cache-quiz-section" id="cuestionario-cache">
          <div className="section-heading">
            <div>
              <h2>Cuestionario de autoevaluación: La memoria caché</h2>
              <p>Las 10 preguntas oficiales del documento adicional de caché. Selecciona una opción para comprobar tu respuesta al instante.</p>
            </div>
            <span className="collection-count">Aciertos: {quizScore} / {quiz.length} ({quizAnswered} respondidas)</span>
          </div>
          {quizAnswered > 0 && (
            <button type="button" className="button button-quiet" style={{ marginBottom: 20 }} onClick={() => setQuizChoices({})}>
              Reiniciar cuestionario
            </button>
          )}
          <div className="quiz-grid">
            {quiz.map((item, idx) => {
              const selected = quizChoices[item.id];
              const answered = selected !== undefined;
              const isCorrect = selected === item.correct;
              return (
                <div key={item.id} className="quiz-card">
                  <header>
                    <span className="exercise-number">P{idx + 1}</span>
                    <span className="origin-label">Cuestionario Caché UNED</span>
                  </header>
                  <p className="quiz-question">{item.question}</p>
                  <div className="quiz-options">
                    {item.options.map((opt, optIdx) => {
                      let cls = 'quiz-option';
                      if (answered) {
                        if (optIdx === item.correct) cls += ' is-correct';
                        else if (optIdx === selected) cls += ' is-wrong';
                      }
                      return (
                        <button
                          type="button"
                          key={optIdx}
                          className={cls}
                          onClick={() => setQuizChoices((cur) => ({ ...cur, [item.id]: optIdx }))}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <div className={isCorrect ? 'quiz-feedback is-ok' : 'quiz-feedback is-ko'}>
                      <strong>{isCorrect ? 'Correcta.' : 'Incorrecta.'}</strong> {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
