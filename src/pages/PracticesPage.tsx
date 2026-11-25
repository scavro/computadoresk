import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Binary, Boxes, Cable, Check, Cpu, Gauge, GitBranch, HardDrive, Image, Layers, MemoryStick, Sigma, ToggleLeft, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { practiceMeta } from '../data/course';
import { useProgress } from '../context/progress';
import { PageHeader } from '../components/PageHeader';

const icons: Record<string, LucideIcon> = {
  binary: Binary,
  toggle: ToggleLeft,
  sigma: Sigma,
  image: Image,
  gauge: Gauge,
  memory: MemoryStick,
  boxes: Boxes,
  waves: Waves,
  layers: Layers,
  harddrive: HardDrive,
  cable: Cable,
  gitbranch: GitBranch,
};

export function PracticesPage() {
  const { completedPractices } = useProgress();
  const [filter, setFilter] = useState<0 | 1 | 2 | 3 | 4>(0);
  const visible = practiceMeta.filter((p) => filter === 0 || p.topic === filter);

  return (
    <div className="page-shell practices-page">
      <PageHeader
        title="Laboratorio de computadores"
        description="Doce posiciones interactivas (calculadoras paso a paso, diagramas SVG animados y dos escenas 3D en Three.js) para experimentar con los cuatro temas del Bloque I."
        aside={<span className="collection-stamp gold">{completedPractices.length} / {practiceMeta.length}<br /><small>completadas</small></span>}
      />
      <div className="exercise-toolbar">
        <div className="filter-tabs" aria-label="Filtrar prácticas por tema" style={{ marginLeft: 0 }}>
          {([0, 1, 2, 3, 4] as const).map((t) => (
            <button key={t} type="button" className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>
              {t === 0 ? 'Todas (12)' : `Tema ${t}`}
            </button>
          ))}
        </div>
      </div>
      <div className="practice-album">
        {visible.map((practice) => {
          const Icon = icons[practice.icon] ?? Cpu;
          const done = completedPractices.includes(practice.id);
          return (
            <Link className={done ? 'practice-slot is-complete' : 'practice-slot'} to={`/practicas/${practice.id}`} key={practice.id}>
              <div className="practice-slot-top"><span>{practice.number}</span><small>Tema {practice.topic}</small></div>
              <div className="practice-art"><Icon strokeWidth={1.25} /></div>
              <h2>{practice.title}</h2>
              <p>{practice.description}</p>
              <footer><span>{done ? <><Check size={16} /> Completada</> : 'Abrir práctica'}</span><ArrowRight size={18} /></footer>
            </Link>
          );
        })}
      </div>
      <p className="practice-disclaimer">Prácticas de apoyo no oficiales. No sustituyen a la PEC/PED de la asignatura.</p>
    </div>
  );
}
