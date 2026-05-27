import React, { useState, useMemo } from 'react';
import { makersProjects, type MakersProject } from '../../data/makersProjects';

// ─── Figma assets (nodo 1:1131 — expiran ~7 días) ────────────────────────────
const FIGMA_LOGOTYPE_BOLD   = 'https://www.figma.com/api/mcp/asset/4e35fbe2-04e0-44f5-a694-dd2ad89c69b4';
const FIGMA_IX_AI_NAVBAR    = 'https://www.figma.com/api/mcp/asset/77d57979-b10d-4b9b-a6fe-82f7a3ef4cef';
const FIGMA_IX_AI_HERO      = 'https://www.figma.com/api/mcp/asset/b49a40ee-f549-4018-811c-937379ac4ded';
const FIGMA_HERO_TITLE      = 'https://www.figma.com/api/mcp/asset/56b61163-8103-4bfe-9978-1691eff640f6';
const FIGMA_HERO_BG         = 'https://www.figma.com/api/mcp/asset/a3e526b5-fb50-4251-bc6a-708d39f6deec';

// ─── MERLin Icon ──────────────────────────────────────────────────────────────

function MerlinIcon() {
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
      {/* Sparkle / AI star icon */}
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2L12.545 7.908L18 11L12.545 14.092L11 20L9.455 14.092L4 11L9.455 7.908L11 2Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path
          d="M17.5 3L18.25 5.75L21 6.5L18.25 7.25L17.5 10L16.75 7.25L14 6.5L16.75 5.75L17.5 3Z"
          fill="white"
          fillOpacity="0.7"
        />
      </svg>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}

function Chip({ label, active, onClick, small = false }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: small ? 28 : 36,
        padding: small ? '0 10px' : '0 16px',
        borderRadius: 100,
        border: active ? 'none' : '1.5px solid var(--black-40)',
        backgroundColor: active ? 'var(--blue-100)' : 'transparent',
        color: active ? 'var(--black-0)' : 'var(--black-60)',
        fontSize: small ? 11 : 13,
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
    >
      {label}
    </button>
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
        <MerlinIcon />
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

// ─── Filter Row ───────────────────────────────────────────────────────────────

interface FilterRowProps {
  label: string;
  options: string[];
  active: string;
  onChange: (value: string) => void;
}

function FilterRow({ label, options, active, onChange }: FilterRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--black-40)',
          fontFamily: "'Montserrat', sans-serif",
          minWidth: 60,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <Chip
            key={opt}
            label={opt}
            active={active === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MakersLanding ────────────────────────────────────────────────────────────

const TEAM_OPTIONS = ['Todos', 'UX', 'CS', 'SaaS', 'Data', 'Plataforma'];
const TOOLS_OPTIONS = ['Todos', 'Claude Code', 'Figma', 'Cursor', 'Notion AI'];
const PROCESS_OPTIONS = ['Todos', 'Capacitación', 'Ventas', 'Soporte', 'Onboarding'];

export function MakersLanding() {
  const [teamFilter, setTeamFilter] = useState('Todos');
  const [toolFilter, setToolFilter] = useState('Todos');
  const [processFilter, setProcessFilter] = useState('Todos');

  const filtered = useMemo(() => {
    return makersProjects.filter(p => {
      const matchTeam =
        teamFilter === 'Todos' || p.teams.includes(teamFilter);
      const matchTool =
        toolFilter === 'Todos' || p.tools.includes(toolFilter);
      const matchProcess =
        processFilter === 'Todos' || p.process === processFilter;
      return matchTeam && matchTool && matchProcess;
    });
  }, [teamFilter, toolFilter, processFilter]);

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

      {/* ── Hero — Figma nodo 1:1019 ── */}
      <section
        style={{
          position: 'relative',
          height: 336,
          overflow: 'hidden',
        }}
      >
        {/* Gradient background image (Efecto 1) */}
        <img
          src={FIGMA_HERO_BG}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />

        {/* Centered content column */}
        <div
          style={{
            position: 'absolute',
            top: 122,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 594,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          {/* Badge + title group */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 25,
            }}
          >
            {/* "AI - PROYECTS" pill badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 11,
                height: 28,
                padding: '0 12px',
                borderRadius: 100,
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.38)',
                flexShrink: 0,
              }}
            >
              <img src={FIGMA_IX_AI_HERO} alt="" style={{ width: 14, height: 14, flexShrink: 0, display: 'block' }} />
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  color: 'var(--black-0)',
                  letterSpacing: '2.76px',
                  whiteSpace: 'nowrap',
                  lineHeight: '20px',
                }}
              >
                AI - PROYECTS
              </span>
            </div>

            {/* "b-makers" title — vector image from Figma */}
            <img
              src={FIGMA_HERO_TITLE}
              alt="b-makers"
              style={{
                width: 495,
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* Subtitle */}
          <p
            style={{
              margin: 0,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: 'var(--black-0)',
              textAlign: 'center',
              lineHeight: '24px',
              whiteSpace: 'nowrap',
            }}
          >
            Proyectos creados con inteligencia artificial en Bold
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>

        {/* Filters panel */}
        <div
          style={{
            backgroundColor: 'var(--black-0)',
            borderRadius: 16,
            boxShadow: '0px 4px 12px 0px rgba(18,30,108,0.08)',
            padding: '20px 24px',
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <FilterRow
            label="Equipo"
            options={TEAM_OPTIONS}
            active={teamFilter}
            onChange={setTeamFilter}
          />
          <div style={{ height: 1, backgroundColor: 'var(--black-10)' }} />
          <FilterRow
            label="Tools"
            options={TOOLS_OPTIONS}
            active={toolFilter}
            onChange={setToolFilter}
          />
          <div style={{ height: 1, backgroundColor: 'var(--black-10)' }} />
          <FilterRow
            label="Proceso"
            options={PROCESS_OPTIONS}
            active={processFilter}
            onChange={setProcessFilter}
          />
        </div>

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
          {(teamFilter !== 'Todos' || toolFilter !== 'Todos' || processFilter !== 'Todos') && (
            <button
              onClick={() => {
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
