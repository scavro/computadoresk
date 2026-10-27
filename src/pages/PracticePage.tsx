import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { practiceMeta } from '../data/course';
import { useProgress } from '../context/progress';
import { EmptyState } from '../components/EmptyState';
import { PracticeLab } from '../practices/PracticeLab';

export function PracticePage() {
  const { practiceId = '' } = useParams();
  const index = practiceMeta.findIndex((item) => item.id === practiceId);
  const practice = practiceMeta[index];
  const { completedPractices, toggle } = useProgress();
  if (!practice) return <EmptyState title="Práctica no encontrada"><p>La posición solicitada no pertenece al laboratorio.</p><Link className="text-link" to="/practicas">Volver al catálogo</Link></EmptyState>;
  const next = practiceMeta[index + 1];
  const done = completedPractices.includes(practice.id);

  return (
    <div className="page-shell practice-detail">
      <Link className="back-link" to="/practicas"><ArrowLeft size={16} /> Laboratorio</Link>
      <header className="practice-detail-header"><div><span>{practice.number} · Tema {practice.topic}</span><h1>{practice.title}</h1><p>{practice.description}</p></div><button className={done ? 'read-toggle is-read' : 'read-toggle'} onClick={() => toggle('completedPractices', practice.id)}>{done ? <CheckCircle2 /> : <Circle />}{done ? 'Práctica completada' : 'Marcar como completada'}</button></header>
      <PracticeLab id={practice.id} />
      <div className="practice-next">{next ? <Link to={`/practicas/${next.id}`}><span><small>Siguiente posición · {next.number}</small><strong>{next.title}</strong></span><ArrowRight /></Link> : <Link to="/examen"><span><small>Laboratorio completado</small><strong>Continuar con el banco de examen</strong></span><ArrowRight /></Link>}</div>
    </div>
  );
}
