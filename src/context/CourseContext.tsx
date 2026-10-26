import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ExerciseDocument, SourcesFile, Topic } from '../types';

interface CourseContextValue {
  topics: Record<number, Topic | null>;
  exercises: ExerciseDocument | null;
  sources: SourceDocument[];
  loading: boolean;
  available: boolean;
}

interface SourceDocument {
  id: string;
  title: string;
  file: string;
  pages?: number;
  description: string;
}

const CourseContext = createContext<CourseContextValue | null>(null);

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

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourse debe utilizarse dentro de CourseProvider');
  return context;
}
