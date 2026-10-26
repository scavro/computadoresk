import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Github, Menu, Search, X } from 'lucide-react';

const links = [
  { to: '/temas/1', label: 'Apuntes' },
  { to: '/ejercicios/tema-1', label: 'Ejercicios' },
  { to: '/examen', label: 'Examen' },
  { to: '/practicas', label: 'Prácticas' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Fundamentos de Computadores, inicio" onClick={() => setOpen(false)}>
        <span className="brand-mark"><BookOpen size={23} strokeWidth={1.8} /></span>
        <span><strong>Fundamentos</strong><small>de Computadores</small></span>
      </Link>
      <nav className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/guia" onClick={() => setOpen(false)}>Guía</NavLink>
      </nav>
      <div className="header-actions">
        <Link className="icon-button" to="/buscar" aria-label="Buscar en el curso"><Search size={19} /></Link>
        <a className="icon-button github-link" href="https://github.com/scavro/computadoresk" target="_blank" rel="noreferrer" aria-label="Repositorio en GitHub"><Github size={19} /></a>
        <button className="icon-button menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
