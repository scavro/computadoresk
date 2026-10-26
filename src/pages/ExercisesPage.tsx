import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Eye, EyeOff, Printer, Search } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { useProgress } from '../context/ProgressContext';
import { CourseBlocks } from '../components/CourseBlocks';
import { EmptyState, LoadingState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';

export function ExercisesPage({ solutions }: { solutions: boolean }) {
  const { exercises, loading } = useCourse();
  const { completedExercises, toggle } = useProgress();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState<string[]>([]);

  const filtered = useMemo(() => exercises?.exercises.filter((exercise) => `${exercise.id} ${exercise.number} ${JSON.stringify(exercise.statement)}`.toLowerCase().includes(query.toLowerCase())) ?? [], [exercises, query]);

  if (loading) return <LoadingState />;
  if (!exercises) return <EmptyState><p>Los ejercicios oficiales están disponibles en la copia local. Ejecuta <code>npm run content:extract</code> para generarlos desde los PDF.</p><Link className="text-link" to="/examen/ejercicios">Abrir el banco de repaso</Link></EmptyState>;

  return (
    <div className="page-shell exercises-page">
      <Link className="back-link" to={solutions ? '/ejercicios/tema-1' : '/temas/1'}><ArrowLeft size={16} />{solutions ? 'Volver a los enunciados' : 'Volver al Tema 1'}</Link>
      <PageHeader
        title={solutions ? 'Soluciones del Tema 1' : 'Ejercicios del Tema 1'}
        description={solutions ? 'Desarrollo completo de los 27 ejercicios. Contrasta el procedimiento después de intentar cada problema.' : '27 ejercicios del material docente. Las soluciones están en una colección separada para que puedas resolver sin pistas.'}
        aside={<span className="collection-stamp">{completedExercises.length} / 27<br /><small>completados</small></span>}
      />
      <div className="exercise-toolbar">
        <div className="segmented-control">
          <Link className={!solutions ? 'active' : ''} to="/ejercicios/tema-1">Enunciados</Link>
          <Link className={solutions ? 'active' : ''} to="/ejercicios/tema-1/soluciones">Soluciones</Link>
        </div>
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
              <header><span className="exercise-number">{exercise.number}</span><span className="origin-label">Material UNED</span></header>
              <CourseBlocks blocks={solutions ? exercise.solution : exercise.statement} />
              <footer>
                <button className={done ? 'read-toggle is-read' : 'read-toggle'} onClick={() => toggle('completedExercises', key)}>{done ? <CheckCircle2 size={18} /> : <Circle size={18} />}{done ? 'Completado' : 'Marcar como completado'}</button>
                {solutions ? (
                  <button className="text-button" onClick={() => setVisible((current) => showSolution ? current.filter((id) => id !== exercise.id) : [...current, exercise.id])}>{showSolution ? <EyeOff size={17} /> : <Eye size={17} />}{showSolution ? 'Ocultar enunciado' : 'Ver enunciado'}</button>
                ) : <Link className="text-link" to={`/ejercicios/tema-1/soluciones#ejercicio-${exercise.id}`}>Ver solución <ArrowRight size={16} /></Link>}
              </footer>
              {solutions && showSolution && <details open className="statement-reveal"><summary>Enunciado {exercise.number}</summary><CourseBlocks blocks={exercise.statement} /></details>}
            </article>
          );
        })}
      </div>
    </div>
  );
}
