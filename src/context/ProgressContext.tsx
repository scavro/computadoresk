import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ProgressContext, emptyProgress } from './progress';
import type { ProgressState } from './progress';

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
