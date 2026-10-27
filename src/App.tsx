import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CourseProvider } from './context/CourseContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ExamPage, ExamExercisesPage, SimulacroPage } from './pages/ExamPage';
import { PracticesPage } from './pages/PracticesPage';
import { PracticePage } from './pages/PracticePage';
import { GuidePage } from './pages/GuidePage';
import { SourcesPage } from './pages/SourcesPage';
import { SearchPage } from './pages/SearchPage';

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      let attempts = 0;
      const scrollToTarget = () => {
        if (cancelled) return;
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView();
          return;
        }
        attempts += 1;
        if (attempts < 40) timer = window.setTimeout(scrollToTarget, 50);
      };
      scrollToTarget();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.getElementById('contenido')?.focus({ preventScroll: true });
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [location.pathname, location.hash]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main id="contenido" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/temas/:topicId" element={<TopicPage />} />
          <Route path="/ejercicios/tema-1" element={<ExercisesPage solutions={false} />} />
          <Route path="/ejercicios/tema-1/soluciones" element={<ExercisesPage solutions />} />
          <Route path="/examen" element={<ExamPage />} />
          <Route path="/examen/ejercicios" element={<ExamExercisesPage solutions={false} />} />
          <Route path="/examen/soluciones" element={<ExamExercisesPage solutions />} />
          <Route path="/examen/simulacro" element={<SimulacroPage />} />
          <Route path="/practicas" element={<PracticesPage />} />
          <Route path="/practicas/:practiceId" element={<PracticePage />} />
          <Route path="/guia" element={<GuidePage />} />
          <Route path="/fuentes" element={<SourcesPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/inicio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <CourseProvider>
          <ProgressProvider>
            <AppRoutes />
          </ProgressProvider>
        </CourseProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
