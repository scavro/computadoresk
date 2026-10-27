import { createContext, useContext } from 'react';

export interface ProgressState {
  readSections: string[];
  completedExercises: string[];
  completedPractices: string[];
}

export interface ProgressContextValue extends ProgressState {
  toggle: (key: keyof ProgressState, id: string) => void;
  reset: () => void;
}

export const emptyProgress: ProgressState = { readSections: [], completedExercises: [], completedPractices: [] };
export const ProgressContext = createContext<ProgressContextValue | null>(null);

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress debe utilizarse dentro de ProgressProvider');
  return context;
}
