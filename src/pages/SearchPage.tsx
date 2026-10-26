import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { examExercises } from '../data/exam';
import { practiceMeta, topicMeta } from '../data/course';
import { useCourse } from '../context/CourseContext';

interface Result { title: string; type: string; description: string; to: string }
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { topics } = useCourse();
  const results = useMemo<Result[]>(() => {
    const term = normalize(query.trim());
    if (term.length < 2) return [];
    const all: Result[] = [
      ...topicMeta.map((topic) => ({ title: `Tema ${topic.id} · ${topic.shortTitle}`, type: 'Apuntes', description: topic.description, to: `/temas/${topic.id}` })),
      ...examExercises.map((exercise) => ({ title: `${exercise.id} · ${exercise.title}`, type: 'Tipo examen', description: exercise.statement.join(' ').slice(0, 180), to: `/examen/ejercicios#${exercise.id}` })),
      ...practiceMeta.map((practice) => ({ title: `${practice.number} · ${practice.title}`, type: 'Práctica', description: practice.description, to: `/practicas/${practice.id}` })),
      { title: 'Ejercicios del Tema 1', type: 'Ejercicios', description: '27 ejercicios del material docente con soluciones separadas.', to: '/ejercicios/tema-1' },
      { title: 'Guía y evaluación', type: 'Asignatura', description: 'Examen, PEC, nota final y plan de trabajo.', to: '/guia' },
    ];
    Object.values(topics).forEach((topic) => topic?.sections.forEach((section) => all.push({ title: `${section.number} · ${section.title}`, type: `Tema ${topic.id}`, description: section.blocks.map((block) => block.text).join(' ').slice(0, 180), to: `/temas/${topic.id}#${section.id}` })));
    return all.filter((item) => normalize(`${item.title} ${item.description} ${item.type}`).includes(term)).slice(0, 40);
  }, [query, topics]);

  return (
    <div className="page-shell search-page">
      <PageHeader title="Buscar en el álbum" description="Localiza conceptos, secciones, ejercicios tipo examen y prácticas." />
      <label className="search-hero"><Search size={25} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Por ejemplo: complemento a 2, DDR, MIPS…" aria-label="Buscar en el curso" /><span>{query.trim().length >= 2 ? `${results.length} resultados` : 'Escribe al menos 2 letras'}</span></label>
      {query.trim().length >= 2 && results.length === 0 && <div className="empty-state"><h2>No hay coincidencias</h2><p>Prueba con un término más general o revisa la ortografía.</p></div>}
      <div className="search-results">{results.map((result, index) => <Link to={result.to} key={`${result.to}-${index}`}><span>{result.type}</span><div><h2>{result.title}</h2><p>{result.description}…</p></div><ArrowRight /></Link>)}</div>
    </div>
  );
}
