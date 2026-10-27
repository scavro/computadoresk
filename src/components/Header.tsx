import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Github, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../context/theme';

const links = [
  { to: '/temas/1', label: 'Apuntes' },
  { to: '/ejercicios/tema-1', label: 'Ejercicios' },
  { to: '/examen', label: 'Examen' },
  { to: '/practicas', label: 'Prácticas' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido" onClick={(event) => {
        event.preventDefault();
        document.getElementById('contenido')?.focus();
      }}>Saltar al contenido</a>
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
        <button className="icon-button theme-toggle" type="button" onClick={toggle} aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}>{theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}</button>
        <Link className="icon-button" to="/buscar" aria-label="Buscar en el curso"><Search size={19} /></Link>
        <a className="icon-button github-link" href="https://github.com/scavro/computadoresk" target="_blank" rel="noreferrer" aria-label="Repositorio en GitHub"><Github size={19} /></a>
        <button className="icon-button menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
