import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Fundamentos de Computadores</strong>
        <p>Álbum de estudio local · Curso 2026–2027</p>
      </div>
      <nav aria-label="Enlaces del pie">
        <Link to="/fuentes">Fuentes y procedencia</Link>
        <Link to="/guia">Evaluación</Link>
        <a href="https://www.uned.es/" target="_blank" rel="noreferrer">UNED</a>
      </nav>
      <p className="footer-note">Material docente original de sus autores. Ejercicios de examen y prácticas: repaso no oficial.</p>
    </footer>
  );
}
