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
  const [topics, setTopics] = useState<Record<number, Topic | null>>({ 1: null, 2: null });
  const [exercises, setExercises] = useState<ExerciseDocument | null>(null);
  const [sources, setSources] = useState<SourceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.all([
      loadJson<Topic>('./content/topic-1.json'),
      loadJson<Topic>('./content/topic-2.json'),
      loadJson<ExerciseDocument>('./content/exercises-1.json'),
      loadJson<SourcesFile>('./content/sources.json'),
    ]).then(([topic1, topic2, exerciseData, sourceData]) => {
      if (!active) return;
      setTopics({ 1: topic1, 2: topic2 });
      setExercises(exerciseData);
      setSources(sourceData?.documents ?? []);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <CourseContext.Provider value={{ topics, exercises, sources, loading, available: Boolean(topics[1] && topics[2]) }}>
      {children}
    </CourseContext.Provider>
  );
}
