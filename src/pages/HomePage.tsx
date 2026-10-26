import { useLayoutEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronRight, FlaskConical, PencilLine } from 'lucide-react';
import gsap from 'gsap';
import { futureTopics, topicMeta } from '../data/course';
import { useProgress } from '../context/ProgressContext';

function TopicArt({ topic }: { topic: number }) {
  if (topic === 1) {
    return (
      <svg viewBox="0 0 220 145" aria-hidden="true">
        <path d="M22 28h176v91H22zM38 45h62v57H38zM119 45h62v15h-62zM119 72h62v30h-62z" />
        <path d="M52 28V15m22 13V15m22 13V15m22 13V15m22 13V15m22 13V15M52 119v14m22-14v14m22-14v14m22-14v14m22-14v14m22-14v14" />
        <text x="48" y="78">01</text><text x="130" y="57">10</text><text x="130" y="92">11</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 145" aria-hidden="true">
      <path d="M35 17h150v112H35zM52 35h116v74H52z" />
      <path d="M62 46h22v22H62zm32 0h22v22H94zm32 0h22v22h-22zM62 78h22v22H62zm32 0h22v22H94zm32 0h22v22h-22z" />
      <path d="M46 17V8m18 9V8m18 9V8m18 9V8m18 9V8m18 9V8m18 9V8m18 9V8M46 129v9m18-9v9m18-9v9m18-9v9m18-9v9m18-9v9m18-9v9m18-9v9" />
    </svg>
  );
}

function MiniArt({ kind }: { kind: 'exercises' | 'exam' | 'practice' }) {
  if (kind === 'practice') {
    return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M23 66 60 79l37-13-37-13zM23 51l37 13 37-13M23 36l37 13 37-13-37-13z" /></svg>;
  }
  if (kind === 'exam') {
    return <svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="45" r="31" /><path d="M60 25v21l15 9M42 9h36M60 9v8" /></svg>;
  }
  return <svg viewBox="0 0 120 90" aria-hidden="true"><path d="M31 14h58v62H31zM42 30h35M42 43h35M42 56h23M24 21h7M24 69h7" /><path d="m72 62 22-22 8 8-22 22-11 3z" /></svg>;
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
      gsap.from('.album-spread .sticker', { scale: 1.08, y: -10, duration: 0.55, stagger: 0.07, ease: 'back.out(1.8)', delay: 0.8 });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={root} className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="edition-tag">UNED · INGENIERÍA EN IA · 2026/27</div>
          <h1>Tu mapa para entender el computador.</h1>
          <p>Apuntes completos, ejercicios resueltos y laboratorios para aprender haciendo. Todo el curso, en un solo álbum.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' })}>
              Abrir el álbum <ArrowRight size={19} />
            </button>
            <Link className="button button-secondary" to="/examen">Preparar el examen</Link>
          </div>
          <div className="local-note"><span /> Funciona en local. Tu progreso se queda en tu navegador.</div>
        </div>

        <div className="album-stage" aria-label="Mapa visual del curso">
          <div className="album-spread">
            <div className="album-page album-page-left">
              <div className="album-page-title"><span>Bloque I</span><strong>Hardware</strong></div>
              {topicMeta.map((topic) => (
                <Link key={topic.id} to={`/temas/${topic.id}`} className={`sticker topic-sticker sticker-${topic.color}`} onClick={pressSticker}>
                  <span className="slot-number">0{topic.id}</span>
                  <TopicArt topic={topic.id} />
                  <span className="sticker-copy"><strong>{topic.shortTitle}</strong><small>{topic.id === 1 ? 'Tema completo' : 'Parte 1 disponible'}</small></span>
                </Link>
              ))}
              <div className="ghost-row">
                {futureTopics.slice(0, 2).map((topic) => <div className="ghost-slot" key={topic.id}><span>0{topic.id}</span><small>Pendiente</small></div>)}
              </div>
            </div>
            <div className="album-seam" />
            <div className="album-page album-page-right">
              <div className="album-page-title"><span>Tu colección</span><strong>Práctica</strong></div>
              <Link to="/ejercicios/tema-1" className="sticker mini-sticker" onClick={pressSticker}>
                <span className="slot-number">A1</span><MiniArt kind="exercises" />
                <span className="sticker-copy"><strong>27 ejercicios</strong><small>Con soluciones</small></span>
              </Link>
              <Link to="/examen" className="sticker mini-sticker sticker-red" onClick={pressSticker}>
                <span className="slot-number">E1</span><MiniArt kind="exam" />
                <span className="sticker-copy"><strong>Tipo examen</strong><small>15 problemas nuevos</small></span>
              </Link>
              <Link to="/practicas" className="sticker mini-sticker sticker-gold" onClick={pressSticker}>
                <span className="slot-number">P1</span><MiniArt kind="practice" />
                <span className="sticker-copy"><strong>Laboratorio</strong><small>8 prácticas interactivas</small></span>
              </Link>
              <div className="album-caption">Lee. Prueba. Comprueba.</div>
            </div>
          </div>
          <div className="album-tab">Colección FC–01</div>
        </div>
      </section>

      <section className="collection-section" id="mapa">
        <div className="section-heading">
          <div><h2>Elige tu próxima posición</h2><p>Cada parte del álbum tiene una función distinta.</p></div>
          <span className="collection-count">2 temas disponibles</span>
        </div>
        <div className="collection-ledger">
          <Link to="/temas/1" className="ledger-row">
            <span className="ledger-icon"><BookOpen /></span><span><strong>Apuntes</strong><small>Los dos primeros temas, con figuras, ejemplos y referencias al PDF.</small></span><ChevronRight />
          </Link>
          <Link to="/ejercicios/tema-1" className="ledger-row">
            <span className="ledger-icon"><PencilLine /></span><span><strong>Ejercicios y soluciones</strong><small>Primero resuelve; después contrasta el procedimiento completo.</small></span><ChevronRight />
          </Link>
          <Link to="/examen" className="ledger-row">
            <span className="ledger-icon"><span className="ledger-number">15</span></span><span><strong>Banco tipo examen</strong><small>Problemas nuevos y un simulacro de cinco ejercicios en 120 minutos.</small></span><ChevronRight />
          </Link>
          <Link to="/practicas" className="ledger-row">
            <span className="ledger-icon"><FlaskConical /></span><span><strong>Prácticas interactivas</strong><small>Conversores, memoria, buses y un constructor 3D de ampliaciones.</small></span><ChevronRight />
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
