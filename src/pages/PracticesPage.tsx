import { Link } from 'react-router-dom';
import { ArrowRight, Binary, Boxes, Check, Cpu, Gauge, Image, MemoryStick, Sigma, ToggleLeft, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { practiceMeta } from '../data/course';
import { useProgress } from '../context/progress';
import { PageHeader } from '../components/PageHeader';

const icons: Record<string, LucideIcon> = { binary: Binary, toggle: ToggleLeft, sigma: Sigma, image: Image, gauge: Gauge, memory: MemoryStick, boxes: Boxes, waves: Waves };

export function PracticesPage() {
  const { completedPractices } = useProgress();
  return (
    <div className="page-shell practices-page">
      <PageHeader title="Laboratorio de computadores" description="Ocho posiciones para manipular los modelos del curso. Cada práctica explica el cálculo y conserva tu trabajo en este navegador." aside={<span className="collection-stamp gold">{completedPractices.length} / 8<br /><small>completadas</small></span>} />
      <div className="practice-album">
        {practiceMeta.map((practice) => {
          const Icon = icons[practice.icon] ?? Cpu;
          const done = completedPractices.includes(practice.id);
          return <Link className={done ? 'practice-slot is-complete' : 'practice-slot'} to={`/practicas/${practice.id}`} key={practice.id}><div className="practice-slot-top"><span>{practice.number}</span><small>Tema {practice.topic}</small></div><div className="practice-art"><Icon strokeWidth={1.25} /></div><h2>{practice.title}</h2><p>{practice.description}</p><footer><span>{done ? <><Check size={16} /> Completada</> : 'Abrir práctica'}</span><ArrowRight size={18} /></footer></Link>;
        })}
      </div>
      <p className="practice-disclaimer">Prácticas de apoyo no oficiales. No sustituyen a la PEC/PED de la asignatura.</p>
    </div>
  );
}
