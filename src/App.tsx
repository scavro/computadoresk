import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CourseProvider } from './context/CourseContext';
import { ProgressProvider } from './context/ProgressContext';
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
    if (location.hash) {
      window.setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main id="contenido">
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
      <CourseProvider>
        <ProgressProvider>
          <AppRoutes />
        </ProgressProvider>
      </CourseProvider>
    </HashRouter>
  );
}
