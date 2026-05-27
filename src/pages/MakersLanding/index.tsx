import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UtensilsCrossed, Smartphone, GraduationCap, TrendingUp,
  Wrench, FlaskConical, BarChart3, GitBranch, Newspaper,
  type LucideIcon,
} from 'lucide-react';
import { makersProjects, type MakersProject } from '../../data/makersProjects';

// ─── Mapa iconName → componente Lucide ────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Smartphone,
  GraduationCap,
  TrendingUp,
  Wrench,
  FlaskConical,
  BarChart3,
  GitBranch,
  Newspaper,
};

// ─── Figma assets (nodo 1:1131 — expiran ~7 días) ────────────────────────────
// Navbar (nodo 1:931) — no cambian con cada extracción
const FIGMA_LOGOTYPE_BOLD   = 'https://www.figma.com/api/mcp/asset/4e35fbe2-04e0-44f5-a694-dd2ad89c69b4';
const FIGMA_IX_AI_NAVBAR    = 'https://www.figma.com/api/mcp/asset/77d57979-b10d-4b9b-a6fe-82f7a3ef4cef';
// Hero (nodo 1:1019) — actualizados 2026-05-27
const FIGMA_IX_AI_HERO      = 'https://www.figma.com/api/mcp/asset/b8b9c1c2-0225-4dce-b1a8-8ef173a96534';
const FIGMA_HERO_TITLE      = 'https://www.figma.com/api/mcp/asset/ff86a6f8-3272-4df5-b085-44d5228ef19c';
const FIGMA_HERO_BG         = 'https://www.figma.com/api/mcp/asset/2857d491-91f6-43d6-8c91-ec5a2c9dcfdd';

// ─── Project Icon ─────────────────────────────────────────────────────────────

function ProjectIcon({ iconName }: { iconName: string }) {
  const Icon = ICON_MAP[iconName] ?? UtensilsCrossed;
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'var(--blue-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={24} color="#FFFFFF" strokeWidth={1.8} />
    </div>
  );
}

// ─── Search bar icons (inline SVG — no deps externas) ────────────────────────

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" stroke="#606060" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="#606060" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="5" r="2.5" stroke="#3E4983" strokeWidth="1.4" />
      <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#3E4983" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="5.5" r="2" stroke="#3E4983" strokeWidth="1.4" />
      <path d="M10.5 12.5c.3-1.5 1.4-2.5 2.5-2.5" stroke="#3E4983" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="2.2" stroke="#3E4983" strokeWidth="1.4" />
      <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M11.54 4.46l1.06-1.06M3.4 12.6l1.06-1.06" stroke="#3E4983" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconMovements() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 4h12M2 8h8M2 12h5" stroke="#3E4983" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 10l2.5 2-2.5 2" stroke="#3E4983" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ flexShrink: 0, transition: 'transform 0.15s ease', transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M4 6L8 10L12 6" stroke="#3E4983" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Dropdown pill (nodo 4:58 / 4:59 / 4:60) ─────────────────────────────────

interface DropdownPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

function DropdownPill({ icon, label, value, options, onChange }: DropdownPillProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayLabel = value === 'Todos' ? label : value;

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 40,
          padding: '8px 12px',
          borderRadius: 100,
          backgroundColor: value !== 'Todos' ? 'var(--blue-10)' : 'var(--background-page)',
          border: 'none',
          cursor: 'pointer',
          opacity: value !== 'Todos' ? 1 : 0.8,
          fontFamily: "'Montserrat', sans-serif",
          outline: 'none',
          transition: 'background-color 0.15s',
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: value !== 'Todos' ? 'var(--blue-100)' : 'var(--blue-60)',
            whiteSpace: 'nowrap',
            lineHeight: '16px',
          }}
        >
          {displayLabel}
        </span>
        <IconChevron open={open} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            backgroundColor: 'white',
            borderRadius: 12,
            boxShadow: '0px 8px 20px 0px rgba(18,30,108,0.12)',
            overflow: 'hidden',
            zIndex: 50,
            minWidth: 160,
          }}
        >
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                backgroundColor: value === opt ? 'var(--blue-10)' : 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: value === opt ? 600 : 400,
                color: value === opt ? 'var(--blue-100)' : 'var(--black-60)',
                fontFamily: "'Montserrat', sans-serif",
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => {
                if (value !== opt) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--background-page)';
              }}
              onMouseLeave={e => {
                if (value !== opt) (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Search bar (nodo 4:87) ───────────────────────────────────────────────────
//   Card: bg-white · h:72px · border-radius:14px · shadow Blue/8
//   Bar:  h:40px · gap:12px · search(flex:1) + 3 dropdown pills

interface SearchBarProps {
  searchQuery: string;
  onSearchQuery: (v: string) => void;
  teamFilter: string;
  onTeam: (v: string) => void;
  toolFilter: string;
  onTool: (v: string) => void;
  processFilter: string;
  onProcess: (v: string) => void;
}

function SearchBar({
  searchQuery, onSearchQuery,
  teamFilter, onTeam,
  toolFilter, onTool,
  processFilter, onProcess,
}: SearchBarProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        boxShadow: '0px 8px 20px 0px rgba(18,30,108,0.08)',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
      }}
    >
      {/* Filter options row — gap:12px */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          height: 40,
        }}
      >
        {/* Search input — flex:1 · bg:#F7F8FB · border-radius:30px */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 40,
              padding: '0 12px',
              borderRadius: 30,
              backgroundColor: 'var(--background-page)',
            }}
          >
            <IconSearch />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchQuery(e.target.value)}
              placeholder="Buscar por palabra clave"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--black-100)',
                fontFamily: "'Montserrat', sans-serif",
                lineHeight: '20px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchQuery('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--black-40)', fontSize: 16, lineHeight: 1, padding: '0 2px',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Dropdown pills */}
        <DropdownPill icon={<IconUsers />}     label="Equipo"  value={teamFilter}    options={TEAM_OPTIONS}    onChange={onTeam}    />
        <DropdownPill icon={<IconSettings />}  label="Tools"   value={toolFilter}    options={TOOLS_OPTIONS}   onChange={onTool}    />
        <DropdownPill icon={<IconMovements />} label="Proceso" value={processFilter} options={PROCESS_OPTIONS} onChange={onProcess} />
      </div>
    </div>
  );
}

// ─── Tag inline (equipos, tools, proceso en las cards) ───────────────────────

function InlineTag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: '0 8px',
        borderRadius: 100,
        backgroundColor: 'var(--blue-10)',
        color: 'var(--blue-60)',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: MakersProject }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--black-0)',
        borderRadius: 16,
        boxShadow: '0px 4px 16px 0px rgba(18,30,108,0.08)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0px 8px 20px 0px rgba(18,30,108,0.14)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0px 4px 16px 0px rgba(18,30,108,0.08)';
      }}
    >
      {/* Card header: icon + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <ProjectIcon iconName={project.iconName} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--blue-100)',
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: '20px',
            }}
          >
            {project.name}
          </h3>
        </div>
      </div>

      {/* Description — max 2 lines */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--black-60)',
          lineHeight: '20px',
          fontFamily: "'Montserrat', sans-serif",
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {project.description}
      </p>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'var(--black-10)' }} />

      {/* Makers */}
      <div>
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--black-40)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Makers
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {project.makers.map(maker => (
            <div
              key={maker.name}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--black-100)',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {maker.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: 'var(--black-40)',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                · {maker.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div>
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--black-40)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Equipos
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {project.teams.map(team => (
            <InlineTag key={team} label={team} />
          ))}
        </div>
      </div>

      {/* Tools */}
      <div>
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--black-40)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Tools
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {project.tools.map(tool => (
            <InlineTag key={tool} label={tool} />
          ))}
        </div>
      </div>

      {/* Proceso */}
      <div>
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--black-40)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Proceso
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 24,
            padding: '0 8px',
            borderRadius: 100,
            backgroundColor: 'var(--black-10)',
            color: 'var(--black-60)',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {project.process}
        </span>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 36,
            padding: '0 20px',
            borderRadius: 100,
            backgroundColor: 'var(--coral-100)',
            color: 'var(--black-0)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Montserrat', sans-serif",
            textDecoration: 'none',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--coral-hover)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--coral-100)';
          }}
        >
          Ver proyecto
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── MakersLanding ────────────────────────────────────────────────────────────

const TEAM_OPTIONS = ['Todos', 'UX', 'CS', 'SaaS', 'Data', 'Plataforma'];
const TOOLS_OPTIONS = ['Todos', 'Claude Code', 'Figma', 'Cursor', 'Notion AI'];
const PROCESS_OPTIONS = ['Todos', 'Capacitación', 'Ventas', 'Soporte', 'Onboarding'];

export function MakersLanding() {
  const [searchQuery,   setSearchQuery]   = useState('');
  const [teamFilter,    setTeamFilter]    = useState('Todos');
  const [toolFilter,    setToolFilter]    = useState('Todos');
  const [processFilter, setProcessFilter] = useState('Todos');

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return makersProjects.filter(p => {
      const matchSearch = !q
        || p.name.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || p.makers.some(m => m.name.toLowerCase().includes(q))
        || p.teams.some(t => t.toLowerCase().includes(q))
        || p.tools.some(t => t.toLowerCase().includes(q))
        || p.process.toLowerCase().includes(q);
      const matchTeam    = teamFilter    === 'Todos' || p.teams.includes(teamFilter);
      const matchTool    = toolFilter    === 'Todos' || p.tools.includes(toolFilter);
      const matchProcess = processFilter === 'Todos' || p.process === processFilter;
      return matchSearch && matchTeam && matchTool && matchProcess;
    });
  }, [searchQuery, teamFilter, toolFilter, processFilter]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background-page)',
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* ── Navbar — Figma nodo 1:931 ── */}
      <header style={{ backgroundColor: 'var(--black-0)', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Logotype Bold */}
          <img
            src={FIGMA_LOGOTYPE_BOLD}
            alt="Bold"
            style={{ width: 79, height: 28, flexShrink: 0, display: 'block' }}
          />

          {/* Spacer + "Hecho con IA" tag */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 11,
                height: 28,
                padding: '0 12px',
                borderRadius: 100,
                backgroundColor: 'var(--background-page)',
                flexShrink: 0,
              }}
            >
              <img src={FIGMA_IX_AI_NAVBAR} alt="" style={{ width: 14, height: 14, flexShrink: 0, display: 'block' }} />
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  color: 'var(--blue-100)',
                  letterSpacing: '2.76px',
                  whiteSpace: 'nowrap',
                  lineHeight: '20px',
                }}
              >
                Hecho con IA
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero — 1280×336px ── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: 336,
          overflow: 'hidden',
          background: 'linear-gradient(to right, #0407F5 0%, #121E6C 45%, #FF013E 90%)',
        }}
      >

        {/* ── Dos columnas — izquierda (badge+título+subtítulo) · derecha (card nodo 10:285) ── */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              width: '100%',
              padding: '0 64px',
              display: 'flex',
              alignItems: 'center',
              gap: 48,
            }}
          >

            {/* ── Izquierda: badge · título · subtítulo ── */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 22,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 25 }}>
                {/* "AI - PROYECTS" badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 11,
                    width: 180,
                    height: 28,
                    padding: '0 12px',
                    borderRadius: 100,
                    backgroundColor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.36)',
                    flexShrink: 0,
                  }}
                >
                  <img src={FIGMA_IX_AI_HERO} alt="" style={{ width: 14, height: 14, flexShrink: 0, display: 'block' }} />
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      color: '#FFFFFF',
                      letterSpacing: '2.76px',
                      whiteSpace: 'nowrap',
                      lineHeight: '20px',
                    }}
                  >
                    AI - PROYECTS
                  </span>
                </div>

                {/* "b-makers" title image */}
                <img
                  src={FIGMA_HERO_TITLE}
                  alt="b-makers"
                  style={{ height: 79, width: 'auto', maxWidth: '100%', display: 'block' }}
                />
              </div>

              {/* Subtítulo */}
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: '#FFFFFF',
                  lineHeight: '24px',
                }}
              >
                Proyectos con IA para resolver retos en Bold
              </p>
            </div>

            {/* ── Derecha: card Próximamente disponible — nodo 10:285 ──
                 backdrop-blur:16px · bg:rgba(255,255,255,0.2) · border-radius:20px
                 padding:20px · gap:32px entre bloque de contenido y botón
            */}
            <div
              style={{
                width: 340,
                flexShrink: 0,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.20)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                alignItems: 'flex-start',
              }}
            >
              {/* Título + bullets — gap:20px */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 400,
                    fontSize: 24,
                    color: '#FFFFFF',
                    lineHeight: '28px',
                  }}
                >
                  Próximamente disponible
                </p>

                {/* Bullets — list-disc ms:24px · gap:8px · 16px Regular white lh:24px */}
                <ul style={{ margin: 0, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Crea prototipos funcionales con nuestro Chatbot UX creator.',
                    'Automatiza procesos de tu equipo.',
                    'Crea Dashboard para visualizar datos de forma interactiva.',
                  ].map(item => (
                    <li
                      key={item}
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 400,
                        fontSize: 16,
                        color: '#FFFFFF',
                        lineHeight: '24px',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón — bg:rgba(255,255,255,0.20) · h:36 · px:20 py:8 · border-radius:32
                   texto: 14px Montserrat Medium #FFFFFF lh:20px */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 36,
                  padding: '8px 20px',
                  borderRadius: 32,
                  backgroundColor: 'rgba(255,255,255,0.20)',
                  cursor: 'default',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#FFFFFF',
                    lineHeight: '20px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Crear proyecto con IA
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Search bar — nodo 4:87 · flota sobre el pie del hero ── */}
      {/* top:304px en frame 336px → sobresale 32px antes del fin del hero */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 32px',
          marginTop: -32,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <SearchBar
          searchQuery={searchQuery}
          onSearchQuery={setSearchQuery}
          teamFilter={teamFilter}
          onTeam={setTeamFilter}
          toolFilter={toolFilter}
          onTool={setToolFilter}
          processFilter={processFilter}
          onProcess={setProcessFilter}
        />
      </div>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 40px' }}>

        {/* Results count */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--black-40)',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {filtered.length === 0
              ? 'Sin resultados'
              : `${filtered.length} proyecto${filtered.length !== 1 ? 's' : ''}`}
          </p>
          {(searchQuery !== '' || teamFilter !== 'Todos' || toolFilter !== 'Todos' || processFilter !== 'Todos') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTeamFilter('Todos');
                setToolFilter('Todos');
                setProcessFilter('Todos');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--coral-100)',
                fontFamily: "'Montserrat', sans-serif",
                padding: 0,
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
          >
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'var(--blue-10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 3L16.2 10.4L23 14L16.2 17.6L14 25L11.8 17.6L5 14L11.8 10.4L14 3Z"
                  fill="var(--blue-40)"
                />
              </svg>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--black-60)',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              No hay proyectos con esos filtros
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 400,
                color: 'var(--black-40)',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Prueba combinaciones diferentes
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--black-10)',
          padding: '24px 32px',
          marginTop: 40,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--black-40)',
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Bold Makers · Proyectos internos creados con IA · 2025
        </p>
      </footer>
    </div>
  );
}

export default MakersLanding;
