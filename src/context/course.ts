import { createContext, useContext } from 'react';
import type { ExerciseDocument, SourceDocument, Topic } from '../types';

export interface CourseContextValue {
  topics: Record<number, Topic | null>;
  exercises: ExerciseDocument | null;
  sources: SourceDocument[];
  loading: boolean;
  available: boolean;
}

export const CourseContext = createContext<CourseContextValue | null>(null);

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourse debe utilizarse dentro de CourseProvider');
  return context;
}
