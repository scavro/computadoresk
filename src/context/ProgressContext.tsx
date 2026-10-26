import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ProgressState {
  readSections: string[];
  completedExercises: string[];
  completedPractices: string[];
}

interface ProgressContextValue extends ProgressState {
  toggle: (key: keyof ProgressState, id: string) => void;
  reset: () => void;
}

const emptyProgress: ProgressState = { readSections: [], completedExercises: [], completedPractices: [] };
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useLocalStorage<ProgressState>('fc-progress-v1', emptyProgress);

  const toggle = useCallback((key: keyof ProgressState, id: string) => {
    setProgress((current) => {
      const values = current[key] ?? [];
      return {
        ...emptyProgress,
        ...current,
        [key]: values.includes(id) ? values.filter((value) => value !== id) : [...values, id],
      };
    });
  }, [setProgress]);

  const value = useMemo(() => ({
    readSections: progress.readSections ?? [],
    completedExercises: progress.completedExercises ?? [],
    completedPractices: progress.completedPractices ?? [],
    toggle,
    reset: () => setProgress(emptyProgress),
  }), [progress, setProgress, toggle]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress debe utilizarse dentro de ProgressProvider');
  return context;
}
