import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ExerciseDocument, SourceDocument, SourcesFile, Topic } from '../types';
import { CourseContext } from './course';

async function loadJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export function CourseProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Record<number, Topic | null>>({ 1: null, 2: null, 3: null, 4: null });
  const [exercisesByTopic, setExercisesByTopic] = useState<Record<number, ExerciseDocument | null>>({ 1: null, 2: null, 3: null });
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      loadJson<Topic>('./content/topic-1.json'),
      loadJson<Topic>('./content/topic-2.json'),
      loadJson<Topic>('./content/topic-3.json'),
      loadJson<Topic>('./content/topic-4.json'),
      loadJson<ExerciseDocument>('./content/exercises-1.json'),
      loadJson<ExerciseDocument>('./content/exercises-2.json'),
      loadJson<ExerciseDocument>('./content/exercises-3.json'),
      loadJson<SourcesFile>('./content/sources.json'),
    ]).then(([t1, t2, t3, t4, ex1, ex2, ex3, sourceData]) => {
      if (!active) return;
      setTopics({ 1: t1, 2: t2, 3: t3, 4: t4 });
      setExercisesByTopic({ 1: ex1, 2: ex2, 3: ex3 });
      setSources(sourceData?.documents ?? []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <CourseContext.Provider value={{ topics, exercisesByTopic, sources, loading, available: Boolean(topics[1] && topics[2] && topics[3] && topics[4]) }}>
      {children}
    </CourseContext.Provider>
  );
}
