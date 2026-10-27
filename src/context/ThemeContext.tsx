import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './theme';
import type { Theme } from './theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = window.localStorage.getItem('fc-theme');
      return stored === 'dark' || stored === 'light' ? stored : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('fc-theme', theme);
    } catch {
      // El cambio de tema sigue funcionando aunque no pueda persistirse.
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme((current) => current === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
}
