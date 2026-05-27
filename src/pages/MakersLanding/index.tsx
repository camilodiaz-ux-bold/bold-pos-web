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

      {/* ── Hero ── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          isolation: 'isolate',
          padding: '80px 0 100px',
          background: 'linear-gradient(to right, #0407F5 0%, #121E6C 45%, #FF013E 90%)',
        }}
      >
        {/* ── Dos columnas — izquierda (badge+título+subtítulo) · derecha (card nodo 10:285) ── */}
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            padding: '0 64px',
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            boxSizing: 'border-box',
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

              {/* "b-makers" title — SVG inline */}
              <svg
                width="495"
                height="79"
                viewBox="0 0 495 79"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: 'auto', maxWidth: 480, display: 'block' }}
                aria-label="b-makers"
              >
                <path d="M471.51 78.9998C466.927 78.9998 462.556 78.3653 458.396 77.0962C454.236 75.7566 450.993 74.135 448.666 72.2314L452.368 65.6745C454.624 67.3666 457.515 68.8119 461.04 70.0105C464.565 71.2091 468.231 71.8084 472.038 71.8084C477.185 71.8084 480.887 71.0328 483.143 69.4817C485.399 67.9306 486.527 65.8155 486.527 63.1364C486.527 61.1622 485.857 59.6464 484.518 58.5888C483.249 57.4608 481.556 56.6147 479.441 56.0507C477.326 55.4867 474.964 54.9931 472.356 54.5701C469.818 54.1471 467.279 53.6535 464.741 53.0895C462.203 52.5255 459.841 51.7147 457.656 50.6571C455.54 49.5291 453.848 48.0132 452.579 46.1096C451.31 44.1355 450.676 41.5621 450.676 38.3894C450.676 35.2872 451.557 32.5375 453.32 30.1404C455.082 27.6728 457.62 25.7339 460.934 24.3238C464.318 22.9137 468.372 22.2087 473.096 22.2087C476.692 22.2087 480.323 22.7022 483.989 23.6893C487.655 24.6058 490.652 25.8396 492.978 27.3907L489.382 34.0534C486.915 32.3613 484.271 31.1627 481.451 30.4577C478.631 29.7526 475.81 29.4001 472.99 29.4001C468.196 29.4001 464.635 30.2462 462.309 31.9383C460.053 33.5598 458.925 35.6045 458.925 38.0721C458.925 40.1872 459.559 41.8088 460.828 42.9369C462.168 44.065 463.895 44.9463 466.01 45.5808C468.125 46.2154 470.452 46.7441 472.99 47.1672C475.599 47.5902 478.172 48.0837 480.71 48.6477C483.249 49.2118 485.575 50.0226 487.69 51.0801C489.876 52.1377 491.603 53.6183 492.872 55.5219C494.141 57.355 494.776 59.8227 494.776 62.9248C494.776 66.2385 493.859 69.094 492.026 71.4911C490.193 73.8882 487.549 75.7566 484.095 77.0962C480.64 78.3653 476.445 78.9998 471.51 78.9998Z" fill="white"/>
                <path d="M413.73 78.471V22.7375H421.662V37.9664L420.816 34.8994C422.437 30.8102 425.046 27.6728 428.642 25.4871C432.308 23.3015 436.855 22.2087 442.284 22.2087V30.3519C441.932 30.2814 441.614 30.2462 441.332 30.2462C441.05 30.2462 440.733 30.2462 440.381 30.2462C434.67 30.2462 430.157 31.9735 426.844 35.4282C423.601 38.8829 421.979 43.8182 421.979 50.2341V78.471H413.73Z" fill="white"/>
                <path d="M373.498 78.9998C367.646 78.9998 362.499 77.8012 358.057 75.4041C353.616 72.9364 350.161 69.5522 347.693 65.2515C345.226 60.9507 343.992 56.0507 343.992 50.5514C343.992 45.052 345.155 40.1872 347.482 35.957C349.879 31.6562 353.157 28.3073 357.317 25.9101C361.477 23.4425 366.2 22.2087 371.488 22.2087C376.706 22.2087 381.359 23.4072 385.448 25.8044C389.537 28.2015 392.745 31.5505 395.072 35.8512C397.469 40.0815 398.668 45.0168 398.668 50.6571C398.668 51.0096 398.632 51.4327 398.562 51.9262C398.562 52.3492 398.527 52.7722 398.456 53.1953H350.337V47.0614H394.12L390.736 49.388C390.806 45.5103 389.996 42.0909 388.304 39.1297C386.611 36.098 384.32 33.7361 381.429 32.044C378.539 30.2814 375.225 29.4001 371.488 29.4001C367.752 29.4001 364.403 30.2814 361.441 32.044C358.551 33.7361 356.259 36.098 354.567 39.1297C352.946 42.1614 352.135 45.6513 352.135 49.5996V50.9744C352.135 55.0636 353.051 58.6593 354.885 61.7615C356.718 64.8637 359.256 67.2961 362.499 69.0587C365.742 70.8213 369.479 71.7026 373.709 71.7026C377.093 71.7026 380.196 71.1033 383.016 69.9048C385.906 68.7062 388.374 66.9083 390.419 64.5112L395.072 69.9048C392.604 72.8659 389.502 75.1221 385.765 76.6732C382.099 78.2243 378.01 78.9998 373.498 78.9998Z" fill="white"/>
                <path d="M294.495 64.2998L294.706 53.7242L328.548 22.7376H338.807L314.271 46.427L309.618 50.34L294.495 64.2998ZM287.938 78.4712V0H296.187V78.4712H287.938ZM330.875 78.4712L308.032 50.1285L313.531 43.5716L341.133 78.4712H330.875Z" fill="white"/>
                <path d="M260.04 78.471V66.309L259.723 64.1939V43.783C259.723 39.2002 258.418 35.675 255.81 33.2073C253.201 30.7397 249.323 29.5059 244.177 29.5059C240.651 29.5059 237.267 30.1051 234.024 31.3037C230.851 32.4318 228.137 33.9476 225.881 35.8512L222.285 29.7174C225.105 27.3202 228.489 25.4871 232.438 24.218C236.456 22.8785 240.651 22.2087 245.023 22.2087C252.425 22.2087 258.101 24.0418 262.049 27.708C266.068 31.3037 268.077 36.803 268.077 44.206V78.471H260.04ZM241.215 78.9998C236.985 78.9998 233.319 78.33 230.217 76.9904C227.185 75.5803 224.823 73.6415 223.131 71.1738C221.509 68.7062 220.699 65.886 220.699 62.7133C220.699 59.8227 221.404 57.1788 222.814 54.7816C224.224 52.3845 226.515 50.4456 229.688 48.965C232.861 47.4844 237.126 46.7441 242.484 46.7441H261.203V52.878H242.802C237.514 52.878 233.883 53.7946 231.909 55.6277C229.935 57.4608 228.948 59.7522 228.948 62.5018C228.948 65.5335 230.146 67.9659 232.543 69.799C234.94 71.6321 238.254 72.5487 242.484 72.5487C246.644 72.5487 250.205 71.6321 253.166 69.799C256.127 67.8954 258.313 65.181 259.723 61.6558L261.521 67.3666C260.11 70.9623 257.678 73.8177 254.223 75.9329C250.769 77.9775 246.433 78.9998 241.215 78.9998Z" fill="white"/>
                <path d="M113.295 78.471V22.7375H121.227V37.7549L119.958 34.7937C121.65 30.8454 124.364 27.7785 128.101 25.5929C131.838 23.3367 136.244 22.2087 141.321 22.2087C146.679 22.2087 151.262 23.5835 155.069 26.3332C158.947 29.0123 161.45 33.0311 162.578 38.3894L159.299 37.1203C160.921 32.6785 163.812 29.0828 167.971 26.3332C172.131 23.5835 177.102 22.2087 182.883 22.2087C187.395 22.2087 191.343 23.09 194.728 24.8526C198.112 26.6152 200.72 29.2591 202.554 32.7843C204.457 36.3095 205.409 40.7865 205.409 46.2154V78.471H197.054V47.0614C197.054 41.3506 195.715 37.0498 193.035 34.1591C190.356 31.198 186.549 29.7174 181.614 29.7174C177.948 29.7174 174.74 30.4929 171.99 32.044C169.311 33.5951 167.231 35.816 165.75 38.7067C164.27 41.5973 163.53 45.1578 163.53 49.388V78.471H155.175V47.0614C155.175 41.3506 153.8 37.0498 151.05 34.1591C148.371 31.198 144.564 29.7174 139.629 29.7174C136.033 29.7174 132.86 30.4929 130.111 32.044C127.361 33.5951 125.246 35.816 123.765 38.7067C122.285 41.5973 121.544 45.1578 121.544 49.388V78.471H113.295Z" fill="white"/>
                <path d="M68.7917 53.3011V46.0039H96.7114V53.3011H68.7917Z" fill="white"/>
                <path d="M28.9772 78.9999C24.1124 78.9999 19.7412 77.9071 15.8634 75.7215C11.9857 73.5359 8.91877 70.3279 6.66264 66.0977C4.40651 61.8674 3.27843 56.6854 3.27843 50.5515C3.27843 44.4176 4.40651 39.2708 6.66264 35.1111C8.98928 30.8808 12.0914 27.6729 15.9692 25.4873C19.8469 23.3016 24.1829 22.2088 28.9772 22.2088C34.3355 22.2088 39.0946 23.4074 43.2543 25.8045C47.4846 28.2017 50.7982 31.5154 53.1954 35.7456C55.663 39.9759 56.8969 44.9112 56.8969 50.5515C56.8969 56.1918 55.663 61.1624 53.1954 65.4631C50.7982 69.6934 47.4846 73.0071 43.2543 75.4042C39.0946 77.8014 34.3355 78.9999 28.9772 78.9999ZM0 78.4712V0H8.24897V38.7068L7.19141 50.4458L7.9317 62.2905V78.4712H0ZM28.3427 71.7028C32.1499 71.7028 35.5693 70.8215 38.601 69.0589C41.6327 67.2962 44.0298 64.8286 45.7924 61.6559C47.5551 58.4832 48.4364 54.7818 48.4364 50.5515C48.4364 46.3213 47.5551 42.655 45.7924 39.5528C44.0298 36.3802 41.6327 33.9478 38.601 32.2557C35.5693 30.4931 32.1499 29.6118 28.3427 29.6118C24.4649 29.6118 21.0102 30.4931 17.9785 32.2557C14.9469 33.9478 12.5497 36.3802 10.7871 39.5528C9.02453 42.655 8.14322 46.3213 8.14322 50.5515C8.14322 54.7818 9.02453 58.4832 10.7871 61.6559C12.5497 64.8286 14.9469 67.2962 17.9785 69.0589C21.0102 70.8215 24.4649 71.7028 28.3427 71.7028Z" fill="white"/>
              </svg>
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

          {/* ── Derecha: card Próximamente disponible — nodo 10:285 ── */}
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

              {/* Bullets — •• · gap:8px · 16px Regular white lh:24px */}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Crea prototipos funcionales con nuestro Chatbot UX creator.',
                  'Automatiza procesos de tu equipo.',
                  'Crea Dashboard para visualizar datos de forma interactiva.',
                ].map(item => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      gap: 8,
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                      fontSize: 16,
                      color: '#FFFFFF',
                      lineHeight: '24px',
                    }}
                  >
                    <span style={{ flexShrink: 0, lineHeight: '24px' }}>{'•'}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón deshabilitado */}
            <button
              disabled
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                height: 36,
                padding: '8px 20px',
                borderRadius: 32,
                backgroundColor: 'rgba(255,255,255,0.20)',
                border: 'none',
                cursor: 'not-allowed',
                opacity: 0.5,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: '#FFFFFF',
                lineHeight: '20px',
                whiteSpace: 'nowrap',
              }}
            >
              Crear proyecto con IA
            </button>
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
          Bold Makers · Proyectos internos creados con IA · 2026
        </p>
      </footer>
    </div>
  );
}

export default MakersLanding;
