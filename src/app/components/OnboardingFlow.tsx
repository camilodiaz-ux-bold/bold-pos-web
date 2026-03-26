import React, { useState } from 'react';
import svgPaths from '../../imports/svg-6e13qwwc7w';
import imgRectangle from 'figma:asset/93a2b673c1e7fa21a68c0a4396af2f892c21530d.png';
import imgRectangle1 from 'figma:asset/f5af32607e8a76ef24d18725db5489f13901fb2d.png';
import MaskGroupComp from '../../imports/MaskGroup';
import Group911Comp from '../../imports/Group911';
import Group898Comp from '../../imports/Group898';
import WebModal from '../../imports/WebModal';
import {
  Utensils, ShoppingBag, FileText,
  X, Plus, Check, ChevronDown, ChevronUp, Play, Smartphone, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step =
  | 'checkpoint-1' | 'step-1-1' | 'step-1-2'
  | 'checkpoint-2' | 'step-2-1' | 'step-2-2' | 'step-2-3'
  | 'checkpoint-3' | 'step-3-1'
  | 'checkpoint-4';

const STEP_ORDER: Step[] = [
  'checkpoint-1', 'step-1-1', 'step-1-2',
  'checkpoint-2', 'step-2-1', 'step-2-2', 'step-2-3',
  'checkpoint-3', 'step-3-1',
  'checkpoint-4',
];

/**
 * Returns [seg1%, seg2%, seg3%, seg4%] — the proportional fill (0–100)
 * of each progress segment based on the current step.
 *
 * Checkpoint 1: 2 internal steps (1-1, 1-2)
 * Checkpoint 2: 3 internal steps (2-1, 2-2, 2-3)
 * Checkpoint 3: 1 internal step (3-1)
 * Checkpoint 4: final screen
 */
function segmentProgress(step: Step): [number, number, number, number] {
  switch (step) {
    case 'checkpoint-1': return [0, 0, 0, 0];
    case 'step-1-1':     return [50, 0, 0, 0];
    case 'step-1-2':     return [100, 0, 0, 0];
    case 'checkpoint-2': return [100, 0, 0, 0];
    case 'step-2-1':     return [100, 33, 0, 0];
    case 'step-2-2':     return [100, 66, 0, 0];
    case 'step-2-3':     return [100, 100, 0, 0];
    case 'checkpoint-3': return [100, 100, 0, 0];
    case 'step-3-1':     return [100, 100, 100, 0];
    case 'checkpoint-4': return [100, 100, 100, 100];
    default:             return [0, 0, 0, 0];
  }
}

const BACKGROUND: React.CSSProperties = {
  backgroundImage: [
    'linear-gradient(90deg, rgba(247,248,251,0.2) 0%, rgba(247,248,251,0.2) 100%)',
    'linear-gradient(123.413deg, rgba(8,14,255,0.1) 0%, rgba(255,255,255,0.03) 51.571%, rgba(8,14,255,0.2) 101.2%)',
    'linear-gradient(90deg, rgb(247,248,251) 0%, rgb(247,248,251) 100%)',
  ].join(', '),
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function MesaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
      <rect x="3.5" y="8" width="13" height="2" rx="1" />
      <rect x="5" y="10" width="1.5" height="4.5" rx="0.75" />
      <rect x="13.5" y="10" width="1.5" height="4.5" rx="0.75" />
      <rect x="0.5" y="5" width="1.5" height="6.5" rx="0.75" />
      <rect x="0.5" y="8.5" width="3.5" height="1.5" rx="0.75" />
      <rect x="3" y="10" width="1" height="4.5" rx="0.5" />
      <rect x="18" y="5" width="1.5" height="6.5" rx="0.75" />
      <rect x="16" y="8.5" width="3.5" height="1.5" rx="0.75" />
      <rect x="16" y="10" width="1" height="4.5" rx="0.5" />
    </svg>
  );
}

function MostradorIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="4.5" r="2.3" />
      <ellipse cx="10" cy="9.2" rx="3.5" ry="1.2" />
      <rect x="1" y="11" width="18" height="2.2" rx="1.1" />
      <rect x="2" y="13.2" width="16" height="4.3" rx="1" />
    </svg>
  );
}

function MixtoIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
      <rect x="1" y="4" width="7" height="1.2" rx="0.6" />
      <rect x="2" y="5.2" width="0.9" height="2.8" rx="0.45" />
      <rect x="7.1" y="5.2" width="0.9" height="2.8" rx="0.45" />
      <rect x="0" y="3.3" width="0.9" height="3.5" rx="0.45" />
      <rect x="0" y="4.8" width="1.9" height="0.8" rx="0.4" />
      <rect x="9.1" y="3.3" width="0.9" height="3.5" rx="0.45" />
      <rect x="8.1" y="4.8" width="1.9" height="0.8" rx="0.4" />
      <circle cx="15.5" cy="4.5" r="1.6" />
      <ellipse cx="15.5" cy="8" rx="2.4" ry="0.9" />
      <rect x="9.5" y="10.5" width="10" height="1.5" rx="0.75" />
      <rect x="10.5" y="12" width="8" height="2.8" rx="0.7" />
      <rect x="0" y="10" width="8.5" height="0.7" rx="0.35" />
    </svg>
  );
}

// ─── Bold isotype & Bolbot ────────────────────────────────────────────────────

function BoldIsotype() {
  return (
    <div className="relative shrink-0 size-8">
      <div className="absolute inset-[10%]">
        <svg className="absolute block size-full" fill="none" viewBox="0 0 25.6 25.6">
          <path d={svgPaths.p77a8d00} fill="url(#boldIsoGradOB)" />
          <defs>
            <linearGradient id="boldIsoGradOB" x1="12.69" x2="12.69" y1="0" y2="25.6" gradientUnits="userSpaceOnUse">
              <stop offset="0.172" stopColor="#EE424E" />
              <stop offset="0.833" stopColor="#121E6C" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function BolbotIcon() {
  return (
    <div className="overflow-clip relative shrink-0 size-5">
      <div className="absolute inset-[4.69%_22.88%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRectangle} />
        </div>
      </div>
      <div className="absolute inset-[62.06%_24.77%_8.45%_24.77%] opacity-60">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgRectangle1} />
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function OnboardingHeader({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 shrink-0 w-full">
      <BoldIsotype />
      <div className="flex gap-5 items-center">
        <div className="bg-white flex gap-1 h-8 items-center justify-center pl-3 pr-2 py-2 rounded-[100px] shadow-[0px_4px_12px_0px_rgba(18,30,108,0.08)] shrink-0">
          <span style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--blue-100)' }}>Ayuda</span>
          <BolbotIcon />
        </div>
        <button onClick={onExit} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} color="var(--blue-100)" />
        </button>
      </div>
    </div>
  );
}

// ─── Progress bar — proportional animated segments ────────────────────────────

function ProgressBar({ percentages }: { percentages: [number, number, number, number] }) {
  return (
    <div style={{ display: 'flex', gap: 6, width: '100%' }}>
      {percentages.map((pct, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 3, borderRadius: 100,
            backgroundColor: 'var(--black-10)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, left: 0,
              height: '100%',
              width: `${pct}%`,
              backgroundColor: 'var(--coral-100)',
              borderRadius: 100,
              transition: 'width 300ms ease-out',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function OnboardingFooter({
  onBack, onContinue, continueEnabled, percentages, showProgress = true, continueLabel, onSkip,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueEnabled: boolean;
  percentages: [number, number, number, number];
  showProgress?: boolean;
  continueLabel?: string;
  onSkip?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 items-start pb-5 px-6 shrink-0 w-full">
      {showProgress && <ProgressBar percentages={percentages} />}
      <div className="flex h-11 items-center justify-between w-full">
        {onSkip ? (
          <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--blue-100)', textDecoration: 'underline' }}>
            Saltar
          </button>
        ) : onBack ? (
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--blue-100)', textDecoration: 'underline' }}>
            Atrás
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onContinue}
          disabled={!continueEnabled}
          style={{
            height: 44, minWidth: 140, padding: '0 28px',
            borderRadius: 32, border: 'none',
            backgroundColor: continueEnabled ? 'var(--coral-100)' : 'var(--coral-hover)',
            color: '#fff', fontFamily: 'Montserrat, Inter, sans-serif',
            fontSize: 14, fontWeight: 700,
            cursor: continueEnabled ? 'pointer' : 'not-allowed',
            opacity: continueEnabled ? 1 : 0.7,
            transition: 'opacity 0.15s, background-color 0.15s',
          }}
        >
          {continueLabel ?? 'Continuar'}
        </button>
      </div>
    </div>
  );
}

// ─── Checkpoint screen (2-col) ────────────────────────────────────────────────

function CheckpointScreen({
  imageContent, stepLabel, title, description, onBack, onContinue, percentages,
}: {
  imageContent: React.ReactNode;
  stepLabel: string; title: string; description: string;
  onBack?: () => void; onContinue: () => void;
  percentages: [number, number, number, number];
}) {
  return (
    <div className="flex flex-col" style={{ ...BACKGROUND, width: '100vw', height: '100vh', boxShadow: 'inset 1px 1px 16.1px 0px rgba(18,30,108,0.1)' }}>
      <OnboardingHeader onExit={onContinue} />
      <div className="flex flex-1 min-h-0 items-center justify-center px-16 gap-16 py-6">
        <div className="flex-1 h-full min-w-0 flex items-center justify-center overflow-hidden" style={{ maxWidth: 440 }}>
          {imageContent}
        </div>
        <div className="flex flex-col gap-5 flex-1 min-w-0" style={{ maxWidth: 380 }}>
          <span style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-60)', fontWeight: 400 }}>
            {stepLabel}
          </span>
          <h2 style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 28, fontWeight: 700, color: 'var(--blue-100)', margin: 0, lineHeight: 1.2 }}>
            {title}
          </h2>
          <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'var(--black-100)', margin: 0, lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      </div>
      <OnboardingFooter onBack={onBack} onContinue={onContinue} continueEnabled percentages={percentages} />
    </div>
  );
}

// ─── Step wrapper ─────────────────────────────────────────────────────────────

function StepWrapper({
  children, onBack, onContinue, continueEnabled, percentages, continueLabel,
}: {
  children: React.ReactNode;
  onBack?: () => void; onContinue: () => void;
  continueEnabled: boolean;
  percentages: [number, number, number, number];
  continueLabel?: string;
}) {
  return (
    <div className="flex flex-col" style={{ ...BACKGROUND, width: '100vw', height: '100vh', boxShadow: 'inset 1px 1px 16.1px 0px rgba(18,30,108,0.1)' }}>
      <OnboardingHeader onExit={onContinue} />
      <div className="flex flex-1 min-h-0 items-start justify-center overflow-y-auto">
        <div style={{ width: 484, paddingTop: 40, paddingBottom: 32 }}>
          {children}
        </div>
      </div>
      <OnboardingFooter
        onBack={onBack}
        onContinue={onContinue}
        continueEnabled={continueEnabled}
        percentages={percentages}
        continueLabel={continueLabel}
      />
    </div>
  );
}

// ─── Step header ─────────────────────────────────────────────────────────────

function StepHeader({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <div style={{ marginBottom: compact ? 24 : 36 }}>
      <h2 style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 8px', lineHeight: 1.3 }}>
        {title}
      </h2>
      <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'var(--black-100)', margin: 0, lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── SelectionCard ────────────────────────────────────────────────────────────

function SelectionCard({
  icon, title, description, selected, onClick,
}: {
  icon: React.ReactNode; title: string; description: string;
  selected: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, backgroundColor: '#fff',
        border: `2px solid ${selected ? 'var(--coral-100)' : 'transparent'}`,
        borderRadius: 16, padding: 16, cursor: 'pointer',
        position: 'relative', transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 1px rgba(255,41,71,0.1)' : '0 2px 8px rgba(18,30,108,0.06)',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--coral-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={12} color="#fff" strokeWidth={3} />
        </div>
      )}
      <div style={{
        width: 48, height: 48, borderRadius: 100, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundImage: 'linear-gradient(227.684deg, rgba(8,14,255,0.06) 13.583%, rgba(247,248,251,0.02) 50.027%, rgba(8,14,255,0.06) 86.47%)',
        backgroundColor: 'rgba(247,248,251,0.9)',
        color: 'var(--blue-100)',
      }}>
        {icon}
      </div>
      <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 4px' }}>
        {title}
      </p>
      <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-60)', margin: 0, lineHeight: 1.4 }}>
        {description}
      </p>
    </div>
  );
}

// ─── Pill option ─────────────────────────────────────────────────────────────

function PillOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%', height: 56,
        backgroundColor: '#fff',
        border: `2px solid ${selected ? 'var(--coral-100)' : 'transparent'}`,
        borderRadius: 100, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.15s',
        boxShadow: '0 2px 8px rgba(18,30,108,0.06)',
      }}
    >
      <span style={{
        fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14,
        fontWeight: selected ? 600 : 400,
        color: selected ? 'var(--coral-100)' : 'var(--black-100)',
        transition: 'color 0.15s',
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── Radio pill option ────────────────────────────────────────────────────────

function RadioPillOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%', height: 56,
        backgroundColor: '#fff',
        border: `2px solid ${selected ? 'var(--coral-100)' : 'transparent'}`,
        borderRadius: 100, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', boxSizing: 'border-box',
        transition: 'border-color 0.15s',
        boxShadow: '0 2px 8px rgba(18,30,108,0.06)',
      }}
    >
      <span style={{
        fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14,
        fontWeight: selected ? 600 : 400,
        color: selected ? 'var(--coral-100)' : 'var(--black-100)',
        transition: 'color 0.15s',
      }}>
        {label}
      </span>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: `2px solid ${selected ? 'var(--coral-100)' : 'var(--black-10)'}`,
        backgroundColor: selected ? 'var(--coral-100)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.15s',
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />}
      </div>
    </div>
  );
}

// ─── Merlin input ─────────────────────────────────────────────────────────────

function MerlinInput({
  label, placeholder, value, onChange, type = 'text', required, autoFocus,
}: {
  label?: string; placeholder: string; value: string;
  onChange: (v: string) => void; type?: string; required?: boolean; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {label && (
        <label style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--blue-100)' }}>
          {label}{required && <span style={{ color: 'var(--coral-100)' }}> *</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        style={{
          height: 40, width: '100%', backgroundColor: '#fff',
          border: `1px solid ${focused ? 'var(--blue-100)' : 'var(--black-10)'}`,
          borderRadius: 12, padding: '0 12px',
          fontSize: 14, color: 'var(--black-100)', outline: 'none',
          boxSizing: 'border-box', fontFamily: 'Montserrat, Inter, sans-serif',
          transition: 'border-color 0.15s',
        }}
      />
    </div>
  );
}

// ─── City dropdown ────────────────────────────────────────────────────────────

const COLOMBIAN_CITIES = [
  'Barrancabermeja', 'Barranquilla', 'Bello', 'Bogotá D.C.',
  'Bucaramanga', 'Buenaventura', 'Cali', 'Cartagena',
  'Cúcuta', 'Ibagué', 'Manizales', 'Medellín',
  'Montería', 'Pereira', 'Santa Marta', 'Soledad', 'Villavicencio',
];

function CityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', position: 'relative' }}>
      <label style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--blue-100)' }}>
        Ciudad <span style={{ color: 'var(--coral-100)' }}>*</span>
      </label>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          height: 40, width: '100%', backgroundColor: '#fff',
          border: `1px solid ${open ? 'var(--blue-100)' : 'var(--black-10)'}`,
          borderRadius: 12, padding: '0 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <span style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: value ? 'var(--black-100)' : 'var(--black-60)' }}>
          {value || 'Selecciona una ciudad'}
        </span>
        {open ? <ChevronUp size={18} color="var(--blue-100)" /> : <ChevronDown size={18} color="var(--blue-100)" />}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: '#fff', borderRadius: 12,
          boxShadow: '0 8px 20px rgba(18,30,108,0.08)',
          zIndex: 50, maxHeight: 220, overflowY: 'auto',
          marginTop: 4,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 12 }}>
            {COLOMBIAN_CITIES.map(city => (
              <div
                key={city}
                onClick={() => { onChange(city); setOpen(false); }}
                style={{
                  height: 40, borderRadius: 8, padding: '0 12px',
                  display: 'flex', alignItems: 'center', cursor: 'pointer',
                  backgroundColor: value === city ? 'var(--blue-10)' : '#fff',
                  fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14,
                  color: 'var(--blue-100)', transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--blue-10)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = value === city ? 'var(--blue-10)' : '#fff')}
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toggle group ─────────────────────────────────────────────────────────────

function ToggleGroup({ options, selected, onSelect }: {
  options: string[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          style={{
            flex: 1, height: 40, borderRadius: 100, border: 'none', cursor: 'pointer',
            backgroundColor: selected === opt ? 'var(--blue-100)' : 'var(--blue-10)',
            color: selected === opt ? '#fff' : 'var(--black-60)',
            fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14,
            fontWeight: selected === opt ? 700 : 400,
            transition: 'all 0.15s',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Zone chip ────────────────────────────────────────────────────────────────

function ZoneChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      backgroundColor: 'var(--blue-10)', borderRadius: 100,
      padding: '6px 12px', height: 36,
    }}>
      <span style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'var(--black-100)' }}>{label}</span>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
        <X size={14} color="var(--black-60)" />
      </button>
    </div>
  );
}

// ─── Video placeholder ────────────────────────────────────────────────────────

function VideoPlayer() {
  const [playing, setPlaying] = useState(false);
  return (
    <div
      style={{
        width: '100%', maxWidth: 580,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(18,30,108,0.15)',
        position: 'relative', aspectRatio: '16/9',
        background: 'linear-gradient(135deg, var(--blue-100) 0%, #1a2f72 60%, var(--coral-100) 100%)',
        cursor: 'pointer',
      }}
      onClick={() => setPlaying(p => !p)}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 120, height: 120, borderRadius: '50%', backgroundColor: '#fff', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--coral-100)', filter: 'blur(30px)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s',
          transform: playing ? 'scale(0.9)' : 'scale(1)',
        }}>
          {playing ? (
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 4, height: 24, backgroundColor: '#fff', borderRadius: 2 }} />
              <div style={{ width: 4, height: 24, backgroundColor: '#fff', borderRadius: 2 }} />
            </div>
          ) : (
            <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
          )}
        </div>
        <span style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
          {playing ? 'Reproduciendo…' : 'Ver tutorial'}
        </span>
      </div>
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6,
        padding: '3px 8px',
        fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: '#fff',
      }}>
        2:03
      </div>
    </div>
  );
}

// ─── App Download Card ────────────────────────────────────────────────────────

function AppDownloadCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '100%', maxWidth: 580,
        backgroundColor: '#fff', borderRadius: 16,
        padding: '14px 20px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 2px 12px rgba(18,30,108,0.08)',
        transition: 'box-shadow 0.15s',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(18,30,108,0.14)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(18,30,108,0.08)')}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        backgroundColor: 'var(--blue-10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Smartphone size={22} color="var(--blue-100)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--blue-100)', margin: '0 0 2px' }}>
          Descarga la App Bold POS
        </p>
        <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-60)', margin: 0 }}>
          Escanea el QR y gestiona tu negocio desde el celular
        </p>
      </div>
      <ChevronRight size={18} color="var(--black-60)" style={{ flexShrink: 0 }} />
    </div>
  );
}

// ─── App Download Modal ───────────────────────────────────────────────────────

function AppDownloadModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: 640, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', borderRadius: 24 }}>
        <WebModal onClose={onClose} />
      </div>
    </div>
  );
}

// ─── Exit confirmation modal ──────────────────────────────────────────────────

function ExitModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 20, padding: 40,
        width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <h3 style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--blue-100)', margin: 0 }}>
          ¿Salir del onboarding?
        </h3>
        <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'var(--black-60)', margin: 0 }}>
          Perderás el progreso de la configuración. Puedes retomarlo más tarde.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 32, border: '1px solid var(--black-10)', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'var(--blue-100)', fontWeight: 600 }}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ padding: '10px 20px', borderRadius: 32, border: 'none', backgroundColor: 'var(--coral-100)', cursor: 'pointer', fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 700 }}>
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Figma image wrappers ─────────────────────────────────────────────────────

function CP1Image() {
  return (
    <div style={{ width: 405, height: 436, position: 'relative', flexShrink: 0, maxWidth: '100%' }}>
      <MaskGroupComp />
    </div>
  );
}

function CP2Image() {
  return (
    <div style={{ width: 470, height: 252, position: 'relative', flexShrink: 0, maxWidth: '100%' }}>
      <Group911Comp />
    </div>
  );
}

function CP3Image() {
  return (
    <div style={{ width: 400, height: 430, position: 'relative', flexShrink: 0, maxWidth: '100%' }}>
      <Group898Comp />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface OnboardingFlowProps {
  onComplete: (modalidad: 'mesas' | 'mostrador' | 'mixto') => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep]                 = useState<Step>('checkpoint-1');
  const [showExit, setShowExit]         = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);

  // Selections
  const [vertical, setVertical]     = useState<string | null>(null);
  const [modalidad, setModalidad]   = useState<'mesas' | 'mostrador' | 'mixto' | null>(null);
  const [tipoRest, setTipoRest]     = useState<string | null>(null);
  const [otroDesc, setOtroDesc]     = useState('');
  const [ciudad, setCiudad]         = useState('');
  const [direccion, setDireccion]   = useState('');
  const [nit, setNit]               = useState('');
  const [propina, setPropina]       = useState('10%');
  const [zonas, setZonas]           = useState(['Salón', 'Terraza', 'Barra']);
  const [nuevaZona, setNuevaZona]   = useState('');
  const [addingZona, setAddingZona] = useState(false);
  const [empleados, setEmpleados]   = useState<string | null>(null);

  const percentages = segmentProgress(step);

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1]);
    else handleComplete();
  };

  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  const handleComplete = () => onComplete(modalidad ?? 'mesas');

  const canContinue: boolean = (() => {
    if (step === 'step-1-1') return vertical !== null;
    if (step === 'step-1-2') return modalidad !== null;
    if (step === 'step-2-1') return tipoRest !== null && (tipoRest !== 'Otro' || otroDesc.trim() !== '');
    if (step === 'step-2-2') return ciudad !== '' && direccion !== '';
    if (step === 'step-2-3') return empleados !== null;
    return true;
  })();

  const removeZona = (z: string) => setZonas(prev => prev.filter(x => x !== z));
  const addZona = () => {
    if (nuevaZona.trim()) { setZonas(prev => [...prev, nuevaZona.trim()]); setNuevaZona(''); }
    setAddingZona(false);
  };

  const TIPO_OPCIONES = [
    'Menú del día o corrientazo', 'Restaurante a la carta', 'Café o cafetería',
    'Bar o gastrobar', 'Panadería o pastelería', 'Comida rápida', 'Otro',
  ];

  const EMPLEADOS_OPCIONES = [
    'De 0 a 10 empleados',
    'De 11 a 25 empleados',
    'De 26 a 100 empleados',
    '100 o más empleados',
  ];

  return (
    <>
      {/* ══════════════ CHECKPOINT 1 ══════════════ */}
      {step === 'checkpoint-1' && (
        <CheckpointScreen
          imageContent={<CP1Image />}
          stepLabel="Paso 1/4"
          title="Configura tu negocio"
          description="Vamos a personalizar Bold POS según el tipo de negocio que tienes y cómo opera."
          onContinue={goNext}
          percentages={percentages}
        />
      )}

      {/* ══════════════ STEP 1.1 — Vertical ══════════════ */}
      {step === 'step-1-1' && (
        <StepWrapper onBack={goBack} onContinue={goNext} continueEnabled={canContinue} percentages={percentages}>
          <StepHeader title="¿Qué tipo de negocio tienes?" subtitle="Esto nos ayuda a configurar tu experiencia." />
          <div style={{ display: 'flex', gap: 12 }}>
            <SelectionCard
              icon={<Utensils size={22} />}
              title="Restaurantes"
              description="Mesas, comandas, cocina y servicio."
              selected={vertical === 'restaurantes'}
              onClick={() => setVertical('restaurantes')}
            />
            <SelectionCard
              icon={<ShoppingBag size={22} />}
              title="Retail"
              description="Inventario, ventas y facturación."
              selected={vertical === 'retail'}
              onClick={() => setVertical('retail')}
            />
            <SelectionCard
              icon={<FileText size={22} />}
              title="Documentos electrónicos"
              description="Facturas electrónicas para cumplir con la DIAN."
              selected={vertical === 'documentos'}
              onClick={() => setVertical('documentos')}
            />
          </div>
        </StepWrapper>
      )}

      {/* ══════════════ STEP 1.2 — Modalidad ══════════════ */}
      {step === 'step-1-2' && (
        <StepWrapper onBack={goBack} onContinue={goNext} continueEnabled={canContinue} percentages={percentages}>
          <StepHeader title="¿Cómo opera tu restaurante?" subtitle="Puedes cambiarlo después en configuración." />
          <div style={{ display: 'flex', gap: 12 }}>
            <SelectionCard
              icon={<MesaIcon size={24} />}
              title="Mesas"
              description="Servicio a la mesa con meseros."
              selected={modalidad === 'mesas'}
              onClick={() => setModalidad('mesas')}
            />
            <SelectionCard
              icon={<MostradorIcon size={24} />}
              title="Mostrador"
              description="Venta rápida y autoservicio."
              selected={modalidad === 'mostrador'}
              onClick={() => setModalidad('mostrador')}
            />
            <SelectionCard
              icon={<MixtoIcon size={24} />}
              title="Mixto"
              description="Mesas y mostrador juntos."
              selected={modalidad === 'mixto'}
              onClick={() => setModalidad('mixto')}
            />
          </div>
        </StepWrapper>
      )}

      {/* ══════════════ CHECKPOINT 2 ══════════════ */}
      {step === 'checkpoint-2' && (
        <CheckpointScreen
          imageContent={<CP2Image />}
          stepLabel="Paso 2/4"
          title="Cuéntanos de tu restaurante"
          description="Esta información nos ayuda a personalizar tu experiencia y aparecerá en tus documentos."
          onBack={goBack}
          onContinue={goNext}
          percentages={percentages}
        />
      )}

      {/* ══════════════ STEP 2.1 — Tipo restaurante ══════════════ */}
      {step === 'step-2-1' && (
        <StepWrapper onBack={goBack} onContinue={goNext} continueEnabled={canContinue} percentages={percentages}>
          <StepHeader
            title="¿Qué tipo de restaurante es?"
            subtitle="Selecciona el que mejor describa tu negocio."
            compact
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIPO_OPCIONES.map(label => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PillOption
                  label={label}
                  selected={tipoRest === label}
                  onClick={() => { setTipoRest(label); if (label !== 'Otro') setOtroDesc(''); }}
                />
                {label === 'Otro' && tipoRest === 'Otro' && (
                  <div style={{ paddingLeft: 4, paddingRight: 4 }}>
                    <MerlinInput
                      placeholder="Describe tu tipo de restaurante"
                      value={otroDesc}
                      onChange={setOtroDesc}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </StepWrapper>
      )}

      {/* ══════════════ STEP 2.2 — Datos restaurante ══════════════ */}
      {step === 'step-2-2' && (
        <StepWrapper onBack={goBack} onContinue={goNext} continueEnabled={canContinue} percentages={percentages}>
          <StepHeader title="Datos de tu restaurante" subtitle="Esta información aparecerá en tus facturas y recibos." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <CityDropdown value={ciudad} onChange={setCiudad} />
            <MerlinInput label="Dirección" placeholder="Dirección del restaurante" value={direccion} onChange={setDireccion} required />
            <MerlinInput label="NIT (opcional)" placeholder="NIT si aplica" value={nit} onChange={setNit} />
          </div>
        </StepWrapper>
      )}

      {/* ══════════════ STEP 2.3 — Empleados ══════════════ */}
      {step === 'step-2-3' && (
        <StepWrapper onBack={goBack} onContinue={goNext} continueEnabled={canContinue} percentages={percentages}>
          <StepHeader
            title="¿Cuántos empleados tiene tu negocio?"
            subtitle="Elige una opción."
            compact
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {EMPLEADOS_OPCIONES.map(opcion => (
              <RadioPillOption
                key={opcion}
                label={opcion}
                selected={empleados === opcion}
                onClick={() => setEmpleados(opcion)}
              />
            ))}
          </div>
        </StepWrapper>
      )}

      {/* ══════════════ CHECKPOINT 3 ══════════════ */}
      {step === 'checkpoint-3' && (
        <CheckpointScreen
          imageContent={<CP3Image />}
          stepLabel="Paso 3/4"
          title="Personaliza tu experiencia"
          description="Configura las opciones básicas para que Bold POS funcione como tu restaurante lo necesita."
          onBack={goBack}
          onContinue={goNext}
          percentages={percentages}
        />
      )}

      {/* ══════════════ STEP 3.1 — Configuración ══════════════ */}
      {step === 'step-3-1' && (
        <StepWrapper onBack={goBack} onContinue={goNext} continueEnabled percentages={percentages}>
          <StepHeader title="Configuración inicial" subtitle="Puedes modificar todo esto después en ajustes." />

          {/* Propina */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--black-100)', margin: '0 0 4px' }}>
              Propina sugerida
            </p>
            <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-60)', margin: '0 0 12px' }}>
              Se mostrará como opción por defecto al cobrar.
            </p>
            <ToggleGroup options={['0%', '10%', '15%']} selected={propina} onSelect={setPropina} />
            <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-40)', margin: '8px 0 0' }}>
              La propina no afecta la base del IVA.
            </p>
          </div>

          {/* Zonas */}
          <div>
            <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--black-100)', margin: '0 0 4px' }}>
              Zonas de tu restaurante
            </p>
            <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-60)', margin: '0 0 12px' }}>
              Organiza tus mesas por zonas. Puedes agregar más después.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {zonas.map(z => (
                <ZoneChip key={z} label={z} onRemove={() => removeZona(z)} />
              ))}
            </div>
            {addingZona ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  autoFocus
                  placeholder="Nombre de la zona"
                  value={nuevaZona}
                  onChange={e => setNuevaZona(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addZona(); if (e.key === 'Escape') setAddingZona(false); }}
                  style={{
                    flex: 1, height: 36, borderRadius: 100, border: '1px solid var(--black-10)',
                    padding: '0 14px', fontSize: 14, outline: 'none',
                    fontFamily: 'Montserrat, Inter, sans-serif',
                  }}
                />
                <button onClick={addZona} style={{ padding: '6px 14px', borderRadius: 100, border: 'none', backgroundColor: 'var(--blue-100)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Montserrat, Inter, sans-serif' }}>
                  Agregar
                </button>
                <button onClick={() => setAddingZona(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingZona(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue-100)', fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, fontWeight: 600, padding: 0 }}
              >
                <Plus size={16} />
                Agregar zona
              </button>
            )}
          </div>
        </StepWrapper>
      )}

      {/* ══════════════ CHECKPOINT 4 — Video final ══════════════ */}
      {step === 'checkpoint-4' && (
        <div className="flex flex-col" style={{ ...BACKGROUND, width: '100vw', height: '100vh', boxShadow: 'inset 1px 1px 16.1px 0px rgba(18,30,108,0.1)' }}>
          <OnboardingHeader onExit={handleComplete} />

          <div className="flex flex-1 min-h-0 items-center justify-center flex-col" style={{ padding: '0 40px', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 12, color: 'var(--black-60)', margin: '0 0 8px' }}>
                Paso 4/4
              </p>
              <h2 style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--blue-100)', margin: '0 0 8px', lineHeight: 1.2 }}>
                ¡Tu restaurante está listo!
              </h2>
              <p style={{ fontFamily: 'Montserrat, Inter, sans-serif', fontSize: 14, color: 'var(--black-60)', margin: 0 }}>
                Conoce Bold POS Restaurantes en 2 minutos
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <VideoPlayer />
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <AppDownloadCard onClick={() => setShowAppModal(true)} />
            </div>
          </div>

          <OnboardingFooter
            onSkip={handleComplete}
            onContinue={handleComplete}
            continueEnabled
            percentages={[100, 100, 100, 100]}
            showProgress={false}
            continueLabel="Comenzar"
          />
        </div>
      )}

      {/* App download modal */}
      {showAppModal && <AppDownloadModal onClose={() => setShowAppModal(false)} />}

      {/* Exit modal */}
      {showExit && <ExitModal onConfirm={handleComplete} onCancel={() => setShowExit(false)} />}
    </>
  );
}