import { useLayoutEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronRight, FileText, FlaskConical, PencilLine } from 'lucide-react';
import gsap from 'gsap';
import { futureTopics, topicMeta } from '../data/course';
import { useProgress } from '../context/progress';

function MiniArt({ kind }: { kind: 'exercises' | 'exam' | 'practice' }) {
  if (kind === 'practice') {
    return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M23 66 60 79l37-13-37-13zM23 51l37 13 37-13M23 36l37 13 37-13-37-13z" /></svg>;
  }
  if (kind === 'exam') {
    return <svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="45" r="31" /><path d="M60 25v21l15 9M42 9h36M60 9v8" /></svg>;
  }
  return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M31 14h58v62H31zM42 30h35M42 43h35M42 56h23M24 21h7M24 69h7" /><path d="m72 62 22-22 8 8-22 22-11 3z" /></svg>;
}

function CircuitTrace() {
  return (
    <svg className="circuit-trace" viewBox="0 0 360 26" aria-hidden="true">
      <line x1="8" y1="6" x2="295" y2="6" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <line x1="8" y1="6" x2="54" y2="6" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="298" cy="6" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <line x1="8" y1="13" x2="338" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <line x1="8" y1="13" x2="88" y2="13" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="341" cy="13" r="2.8" fill="currentColor" />
      <line x1="8" y1="20" x2="272" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <line x1="8" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="275" cy="20" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function pressSticker(event: MouseEvent<HTMLAnchorElement>) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.fromTo(event.currentTarget, { scale: 1.035 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1, .45)' });
}

export function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  const { completedExercises, completedPractices, readSections } = useProgress();

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.hero-copy > *', { y: 22, opacity: 0, duration: 0.65, stagger: 0.08, ease: 'power3.out' });
      gsap.from('.album-spread', { clipPath: 'inset(0 48% 0 48%)', duration: 1, ease: 'power4.inOut', delay: 0.12 });
      gsap.from('.album-spread .sticker', { scale: 1.06, y: -8, duration: 0.5, stagger: 0.05, ease: 'back.out(1.8)', delay: 0.75 });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={root} className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="edition-tag">UNED · INGENIERÍA EN IA · 2026/27</div>
          <h1>Tu mapa para entender el computador.</h1>
          <p>El Bloque I completo de Hardware reunido en un solo álbum: apuntes con figuras y portadas, 91 ejercicios resueltos, banco de examen y laboratorios 2D y 3D.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' })}>
              Abrir el álbum <ArrowRight size={19} />
            </button>
            <Link className="button button-secondary" to="/examen">Preparar el examen</Link>
          </div>
          <CircuitTrace />
          <div className="local-note"><span /> Funciona en cualquier dispositivo. Tu progreso queda guardado en tu navegador.</div>
        </div>

        <div className="album-stage" aria-label="Mapa visual del curso">
          <div className="album-spread">
            <div className="album-page album-page-left">
              <div className="album-page-title"><span>Bloque I completo</span><strong>Hardware</strong></div>
              <div className="topic-grid-4">
                {topicMeta.map((topic) => (
                  <Link key={topic.id} to={`/temas/${topic.id}`} className={`sticker topic-sticker-compact sticker-${topic.color}`} onClick={pressSticker}>
                    <span className="slot-number">0{topic.id}</span>
                    <div className="sticker-cover-wrap">
                      <img src={topic.cover} alt={`Portada Tema ${topic.id}`} loading="lazy" />
                    </div>
                    <span className="sticker-copy">
                      <strong>{topic.shortTitle}</strong>
                      <small>{topic.pages} págs. · Tema completo</small>
                    </span>
                  </Link>
                ))}
              </div>
              <div className="ghost-row" aria-label="Bloque II pendiente de publicación">
                <div className="ghost-slot"><span>B-II</span><small>Temas 05–07 · Sistemas operativos</small></div>
                <div className="ghost-slot"><span>B-II</span><small>Temas 08–10 · Memoria, E/S y archivos</small></div>
              </div>
            </div>
            <div className="album-seam" />
            <div className="album-page album-page-right">
              <div className="album-page-title"><span>Tu colección</span><strong>Práctica</strong></div>
              <Link to="/ejercicios/tema-1" className="sticker mini-sticker" onClick={pressSticker}>
                <span className="slot-number">A1</span><MiniArt kind="exercises" />
                <span className="sticker-copy"><strong>91 ejercicios</strong><small>Temas 1–3 y test de caché</small></span>
              </Link>
              <Link to="/examen" className="sticker mini-sticker sticker-red" onClick={pressSticker}>
                <span className="slot-number">E1</span><MiniArt kind="exam" />
                <span className="sticker-copy"><strong>Tipo examen</strong><small>25 problemas de desarrollo</small></span>
              </Link>
              <Link to="/practicas" className="sticker mini-sticker sticker-gold" onClick={pressSticker}>
                <span className="slot-number">P1</span><MiniArt kind="practice" />
                <span className="sticker-copy"><strong>Laboratorio</strong><small>12 prácticas 2D y 3D</small></span>
              </Link>
              <div className="album-caption">Lee. Prueba. Comprueba.</div>
            </div>
          </div>
          <div className="album-tab">Colección FC · Bloque I</div>
        </div>
      </section>

      <section className="covers-showcase" aria-label="Cuadernos encuadernados del Bloque I">
        <div className="section-heading">
          <div>
            <h2>Cuadernos y portadas del Bloque I</h2>
            <p>Accede al lector interactivo de cada tema o abre su PDF encuadernado con portada.</p>
          </div>
          <a className="collection-count" href="./fuentes/portadas.pdf" target="_blank" rel="noreferrer">Portadas PDF</a>
        </div>
        <div className="covers-strip">
          <a className="cover-card cover-card-general" href="./fuentes/portadas.pdf" target="_blank" rel="noreferrer">
            <img src="./covers/portada-general.webp" alt="Portada general de Fundamentos de Computadores" loading="lazy" />
            <div><span>Portada general</span><strong>Fundamentos de Computadores</strong></div>
          </a>
          {topicMeta.map((topic) => (
            <Link key={topic.id} className="cover-card" to={`/temas/${topic.id}`}>
              <img src={topic.cover} alt={`Portada del Tema ${topic.id}`} loading="lazy" />
              <div>
                <span>Tema {topic.id} · {topic.pages} págs.</span>
                <strong>{topic.shortTitle}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="collection-section" id="mapa">
        <div className="section-heading">
          <div><h2>Elige tu próxima posición</h2><p>Cada parte del álbum tiene una función distinta y enlaza con el resto.</p></div>
          <span className="collection-count">4 temas completos · {futureTopics.length} de SO futuros</span>
        </div>
        <div className="collection-ledger">
          <Link to="/temas/1" className="ledger-row">
            <span className="ledger-icon"><BookOpen /></span><span><strong>Apuntes del Bloque I (Temas 1 a 4)</strong><small>Representación, unidad de memoria y caché, entrada/salida y procesador (CPU/GPU/NPU), con figuras y enlaces al PDF.</small></span><ChevronRight />
          </Link>
          <Link to="/ejercicios/tema-1" className="ledger-row">
            <span className="ledger-icon"><PencilLine /></span><span><strong>Ejercicios oficiales y soluciones</strong><small>27 del Tema 1, 46 + cuestionario interactivo de caché del Tema 2 y 18 del Tema 3.</small></span><ChevronRight />
          </Link>
          <Link to="/examen" className="ledger-row">
            <span className="ledger-icon"><span className="ledger-number">25</span></span><span><strong>Banco tipo examen</strong><small>Problemas nuevos de los cuatro temas y simulacro cronometrado de cinco ejercicios en 120 minutos.</small></span><ChevronRight />
          </Link>
          <Link to="/practicas" className="ledger-row">
            <span className="ledger-icon"><FlaskConical /></span><span><strong>Prácticas interactivas 2D y 3D</strong><small>Conversores, memoria 3D, disco duro magnético 3D en Three.js, simulador de caché, DMA y pipeline RISC.</small></span><ChevronRight />
          </Link>
          <Link to="/fuentes" className="ledger-row">
            <span className="ledger-icon"><FileText /></span><span><strong>Documentos y PDFs con portada</strong><small>Los 14 documentos originales y cuadernos encuadernados listos para descargar o imprimir.</small></span><ChevronRight />
          </Link>
        </div>
      </section>

      <section className="progress-band">
        <div><span className="progress-label">Tu álbum</span><h2>El progreso se construye pieza a pieza.</h2></div>
        <div className="progress-facts">
          <span><strong>{readSections.length}</strong> secciones leídas</span>
          <span><strong>{completedExercises.length}</strong> ejercicios completados</span>
          <span><strong>{completedPractices.length}</strong> prácticas completadas</span>
        </div>
        {(readSections.length + completedExercises.length + completedPractices.length > 0) && <span className="progress-check"><Check size={18} /> Guardado en este dispositivo</span>}
      </section>
    </div>
  );
}
