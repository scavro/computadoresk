import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Circle, Clock3, Eye, EyeOff, Pause, Play, Printer, RotateCcw, Shuffle } from 'lucide-react';
import { examExercises } from '../data/exam';
import { MathParagraphs } from '../components/RichText';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProgress } from '../context/ProgressContext';

interface SimulacroState {
  ids: string[];
  remaining: number;
  running: boolean;
  finished: boolean;
}

const initialSimulacro: SimulacroState = { ids: [], remaining: 7200, running: false, finished: false };

function pickExercises() {
  return [...examExercises].sort(() => Math.random() - 0.5).slice(0, 5).map((exercise) => exercise.id);
}

export function ExamPage() {
  const navigate = useNavigate();
  const [, setSimulacro] = useLocalStorage<SimulacroState>('fc-simulacro-v1', initialSimulacro);
  const start = () => {
    setSimulacro({ ids: pickExercises(), remaining: 7200, running: true, finished: false });
    navigate('/examen/simulacro');
  };

  return (
    <div className="page-shell exam-home">
      <PageHeader title="Prepara el examen resolviendo." description="Quince problemas nuevos de desarrollo, con soluciones aparte y un simulacro en las condiciones de tiempo de la prueba presencial." aside={<span className="collection-stamp red">15<br /><small>ejercicios</small></span>} />
      <section className="exam-start-panel">
        <div className="exam-clock-art"><AlarmClock strokeWidth={1.25} /><span>120<small>min</small></span></div>
        <div><h2>Simulacro de cinco posiciones</h2><p>Cinco ejercicios aleatorios del banco. Escribe tu desarrollo, gestiona el tiempo y comprueba las soluciones al terminar.</p>
          <ul className="inline-facts"><li>Sin apuntes</li><li>Desarrollo completo</li><li>Calculadora no programable</li></ul>
        </div>
        <button className="button button-primary" onClick={start}><Play size={18} /> Comenzar simulacro</button>
      </section>
      <div className="exam-mode-links">
        <Link to="/examen/ejercicios"><span><strong>Entrenar sin reloj</strong><small>Los 15 enunciados, ordenados por tema.</small></span><ArrowRight /></Link>
        <Link to="/examen/soluciones"><span><strong>Consultar soluciones</strong><small>Procedimientos y resultados, en otra colección.</small></span><ArrowRight /></Link>
      </div>
      <section className="exam-index">
        <div className="section-heading"><div><h2>Contenido del banco</h2><p>Nueve ejercicios del Tema 1 y seis del Tema 2.</p></div><span className="origin-label">Repaso no oficial</span></div>
        {examExercises.map((exercise) => <Link to={`/examen/ejercicios#${exercise.id}`} key={exercise.id}><span>{exercise.id}</span><strong>{exercise.title}</strong><small>Tema {exercise.topic} · {exercise.level}</small><ChevronRight size={18} /></Link>)}
      </section>
    </div>
  );
}

export function ExamExercisesPage({ solutions }: { solutions: boolean }) {
  const [filter, setFilter] = useState<0 | 1 | 2>(0);
  const [visible, setVisible] = useState<string[]>([]);
  const [answers, setAnswers] = useLocalStorage<Record<string, string>>('fc-exam-answers-v1', {});
  const { completedExercises, toggle } = useProgress();
  const filtered = examExercises.filter((exercise) => filter === 0 || exercise.topic === filter);

  return (
    <div className="page-shell exercises-page">
      <Link className="back-link" to="/examen"><ArrowLeft size={16} /> Preparación del examen</Link>
      <PageHeader title={solutions ? 'Soluciones del banco' : 'Banco tipo examen'} description={solutions ? 'Las quince resoluciones, con operaciones y razonamiento. Úsalas para corregir tu propio desarrollo.' : 'Quince problemas originales de desarrollo. Escribe tu resolución antes de abrir la colección de soluciones.'} aside={<span className="origin-label">Material de repaso</span>} />
      <div className="exercise-toolbar">
        <div className="segmented-control"><Link className={!solutions ? 'active' : ''} to="/examen/ejercicios">Enunciados</Link><Link className={solutions ? 'active' : ''} to="/examen/soluciones">Soluciones</Link></div>
        <div className="filter-tabs" aria-label="Filtrar por tema">{([0, 1, 2] as const).map((topic) => <button className={filter === topic ? 'active' : ''} key={topic} onClick={() => setFilter(topic)}>{topic === 0 ? 'Todos' : `Tema ${topic}`}</button>)}</div>
        <button className="icon-button" onClick={() => window.print()} aria-label="Imprimir banco"><Printer size={19} /></button>
      </div>
      <div className="exercise-list">
        {filtered.map((exercise) => {
          const done = completedExercises.includes(`examen:${exercise.id}`);
          const reveal = visible.includes(exercise.id);
          return (
            <article className="exercise-sheet exam-exercise" id={exercise.id} key={exercise.id}>
              <header><span className="exercise-number">{exercise.id}</span><span className="exercise-topic">Tema {exercise.topic} · {exercise.level}</span></header>
              <h2>{exercise.title}</h2>
              <MathParagraphs paragraphs={solutions ? exercise.solution : exercise.statement} />
              {solutions && <div className="final-answer"><strong>Resultado</strong><MathParagraphs paragraphs={[exercise.answer]} /></div>}
              {!solutions && <label className="answer-area"><span>Tu desarrollo <small>Se guarda automáticamente en este navegador</small></span><textarea value={answers[exercise.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [exercise.id]: event.target.value }))} placeholder="Escribe aquí los pasos, cálculos y resultado…" rows={6} /></label>}
              <footer>
                <button className={done ? 'read-toggle is-read' : 'read-toggle'} onClick={() => toggle('completedExercises', `examen:${exercise.id}`)}>{done ? <CheckCircle2 size={18} /> : <Circle size={18} />}{done ? 'Revisado' : 'Marcar como revisado'}</button>
                {solutions ? <button className="text-button" onClick={() => setVisible((current) => reveal ? current.filter((id) => id !== exercise.id) : [...current, exercise.id])}>{reveal ? <EyeOff size={17} /> : <Eye size={17} />}{reveal ? 'Ocultar enunciado' : 'Ver enunciado'}</button> : <Link className="text-link" to={`/examen/soluciones#${exercise.id}`}>Ver solución <ArrowRight size={16} /></Link>}
              </footer>
              {solutions && reveal && <details open className="statement-reveal"><summary>Enunciado {exercise.id}</summary><MathParagraphs paragraphs={exercise.statement} /></details>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function SimulacroPage() {
  const [simulacro, setSimulacro] = useLocalStorage<SimulacroState>('fc-simulacro-v1', initialSimulacro);
  const [answers, setAnswers] = useLocalStorage<Record<string, string>>('fc-simulacro-answers-v1', {});
  const [timerVisible, setTimerVisible] = useState(true);
  const selected = useMemo(() => simulacro.ids.map((id) => examExercises.find((exercise) => exercise.id === id)).filter((exercise) => exercise !== undefined), [simulacro.ids]);

  useEffect(() => {
    if (!simulacro.running || simulacro.finished) return;
    const timer = window.setInterval(() => {
      setSimulacro((current) => {
        if (current.remaining <= 1) return { ...current, remaining: 0, running: false, finished: true };
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [simulacro.running, simulacro.finished, setSimulacro]);

  const restart = () => {
    setSimulacro({ ids: pickExercises(), remaining: 7200, running: true, finished: false });
    setAnswers({});
  };

  if (selected.length !== 5) return <EmptyState title="No hay un simulacro en curso"><p>Genera cinco ejercicios aleatorios para empezar.</p><button className="button button-primary" onClick={restart}><Shuffle size={18} /> Crear simulacro</button></EmptyState>;

  const minutes = Math.floor(simulacro.remaining / 60).toString().padStart(2, '0');
  const seconds = (simulacro.remaining % 60).toString().padStart(2, '0');

  return (
    <div className="page-shell simulacro-page">
      <div className="simulacro-toolbar">
        <div><Link className="back-link" to="/examen"><ArrowLeft size={16} /> Salir del simulacro</Link><h1>Simulacro en curso</h1></div>
        <div className={simulacro.remaining < 600 ? 'timer is-low' : 'timer'}><Clock3 size={20} />{timerVisible && <span>{minutes}:{seconds}</span>}<button onClick={() => setTimerVisible(!timerVisible)} aria-label={timerVisible ? 'Ocultar temporizador' : 'Mostrar temporizador'}>{timerVisible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
        <div className="timer-actions"><button className="button button-secondary" onClick={() => setSimulacro((current) => ({ ...current, running: !current.running }))}>{simulacro.running ? <Pause size={17} /> : <Play size={17} />}{simulacro.running ? 'Pausar' : 'Continuar'}</button><button className="icon-button" onClick={restart} title="Nuevo simulacro" aria-label="Nuevo simulacro"><RotateCcw size={18} /></button></div>
      </div>
      {simulacro.finished && <div className="time-finished"><AlarmClock /><div><strong>{simulacro.remaining === 0 ? 'El tiempo ha terminado' : 'Simulacro finalizado'}</strong><p>Contrasta ahora tus respuestas con el desarrollo completo.</p></div><Link className="button button-primary" to="/examen/soluciones">Abrir soluciones</Link></div>}
      <div className="simulacro-progress"><span style={{ width: `${(simulacro.remaining / 7200) * 100}%` }} /></div>
      {selected.map((exercise, index) => <article className="exercise-sheet" key={exercise.id}><header><span className="exercise-number">{index + 1} / 5</span><span className="exercise-topic">{exercise.id} · Tema {exercise.topic}</span></header><h2>{exercise.title}</h2><MathParagraphs paragraphs={exercise.statement} /><label className="answer-area"><span>Desarrollo</span><textarea rows={8} value={answers[exercise.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [exercise.id]: event.target.value }))} placeholder="Desarrolla tu solución…" /></label></article>)}
      <button className="button button-primary finish-exam" onClick={() => setSimulacro((current) => ({ ...current, running: false, finished: true }))}>Terminar y revisar <ArrowRight size={18} /></button>
    </div>
  );
}
