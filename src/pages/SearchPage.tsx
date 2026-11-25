import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { examExercises } from '../data/exam';
import { practiceMeta, topicMeta } from '../data/course';
import { useCourse } from '../context/course';
import type { ContentBlock } from '../types';

interface Result { title: string; type: string; description: string; to: string; searchText?: string }
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const blockText = (value: ContentBlock[] | string): string => typeof value === 'string' ? value : value.map((block) => block.text).join(' ');

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const setQuery = (value: string) => setSearchParams(value ? { q: value } : {}, { replace: true });
  const { topics, exercisesByTopic } = useCourse();

  const results = useMemo<Result[]>(() => {
    const term = normalize(query.trim());
    if (term.length < 2) return [];
    const all: Result[] = [
      ...topicMeta.map((topic) => ({ title: `Tema ${topic.id} · ${topic.shortTitle}`, type: 'Apuntes', description: topic.description, to: `/temas/${topic.id}` })),
      ...examExercises.map((exercise) => ({ title: `${exercise.id} · ${exercise.title}`, type: 'Tipo examen', description: exercise.statement.join(' ').slice(0, 180), searchText: `${exercise.statement.join(' ')} ${exercise.solution.join(' ')}`, to: `/examen/ejercicios#${exercise.id}` })),
      ...practiceMeta.map((practice) => ({ title: `${practice.number} · ${practice.title}`, type: 'Práctica', description: practice.description, to: `/practicas/${practice.id}` })),
      { title: 'Guía y evaluación', type: 'Asignatura', description: 'Examen, PEC, nota final y plan de trabajo.', to: '/guia' },
    ];

    Object.entries(exercisesByTopic).forEach(([tKey, doc]) => {
      if (!doc) return;
      doc.exercises.forEach((exercise) => {
        const statement = blockText(exercise.statement);
        all.push({
          title: `Ejercicio ${exercise.number}`,
          type: `Ejercicio Tema ${tKey}`,
          description: statement.slice(0, 180),
          searchText: `${statement} ${blockText(exercise.solution)}`,
          to: `/ejercicios/tema-${tKey}#ejercicio-${exercise.id}`,
        });
      });
    });

    Object.values(topics).forEach((topic) => topic?.sections.forEach((section) => {
      const fullText = section.blocks.map((block) => block.text).join(' ');
      all.push({ title: `${section.number} · ${section.title}`, type: `Tema ${topic.id}`, description: fullText.slice(0, 180), searchText: fullText, to: `/temas/${topic.id}#${section.id}` });
    }));

    return all.filter((item) => normalize(`${item.title} ${item.searchText ?? item.description} ${item.type}`).includes(term)).slice(0, 50);
  }, [query, topics, exercisesByTopic]);

  return (
    <div className="page-shell search-page">
      <PageHeader title="Buscar en el álbum" description="Localiza conceptos en los 4 temas, los 91 ejercicios oficiales, el banco de examen y las 12 prácticas." />
      <label className="search-hero"><Search size={25} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Por ejemplo: complemento a 2, caché LRU, DMA, RISC-V, NPU…" aria-label="Buscar en el curso" /><span>{query.trim().length >= 2 ? `${results.length} resultados` : 'Escribe al menos 2 letras'}</span></label>
      {query.trim().length >= 2 && results.length === 0 && <div className="empty-state"><h2>No hay coincidencias</h2><p>Prueba con un término más general o revisa la ortografía.</p></div>}
      <div className="search-results">{results.map((result, index) => <Link to={result.to} key={`${result.to}-${index}`}><span>{result.type}</span><div><h2>{result.title}</h2><p>{result.description}…</p></div><ArrowRight /></Link>)}</div>
    </div>
  );
}
