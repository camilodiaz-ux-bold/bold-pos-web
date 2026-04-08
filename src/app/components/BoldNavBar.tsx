import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router';
import {
  ChevronLeft, ChevronRight, ChevronDown, Plus, Shield, LogOut, Bell, Monitor, MapPin,
  UtensilsCrossed, TrendingUp,
} from 'lucide-react';
import {
  IcHome, IcHomeFill,
  IcMesas, IcTurnos,
  IcRecibos, IcComprobantes, IcCotizaciones,
  IcFacturas, IcNotasCredito, IcNotasDebito,
  IcEgresosFill, IcGastos, IcDocSoporte,
  IcListaItems, IcAjusteInv, IcFlujoInv, IcVariantesInv,
  IcUsuarios, IcUsuariosFill,
  IcReportes, IcReportesFill,
  IcAjustes, IcAjustesFill,
  IcChat, IcChatFill,
} from './BoldPosIcons';
import { toast } from 'sonner';
import svgPaths from '../../imports/svg-5yr7pr5zvq';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  blue100:  '#121e6c',
  blue20:   '#d2d4e1',
  blue10:   '#f1f2f6',
  black100: '#1e1e1e',
  black60:  '#606060',
  black40:  '#969696',
  white:    '#ffffff',
};

const FONT = 'Montserrat, sans-serif';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavBarProps {
  activeMode: 'Mesas' | 'Mostrador' | 'Reportes' | 'Inicio' | 'Turnos';
  onModeChange: (mode: 'Mesas' | 'Mostrador' | 'Reportes' | 'Inicio' | 'Turnos') => void;
}

interface SubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: (isActive: boolean, size?: number) => React.ReactNode;
  hasSubmenu: boolean;
  subItems?: SubItem[];
  onClick?: () => void;
}

// ─── Bold SVG Logo ─────────────────────────────────────────────────────────────

function BoldLogo() {
  return (
    <svg
      width="79"
      height="28"
      viewBox="0 0 140.621 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d={svgPaths.p210b6200} fill="#121E6C" />
    </svg>
  );
}

// ─── Custom operation icons ───────────────────────────────────────────────────


function MostradorIcon({ size = 20 }: { size?: number }) {
  return <Monitor size={size} />;
}

// ─── Main NavBar component ────────────────────────────────────────────────────

export function BoldNavBar({ activeMode, onModeChange }: NavBarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inPosView = activeMode === 'Mesas' || activeMode === 'Mostrador' || activeMode === 'Turnos';
  const [isExpanded, setIsExpanded] = useState(!inPosView);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['puntodeventa']));

  // Sync expanded state when navigating between POS ↔ non-POS sections
  const prevInPosView = useRef(inPosView);
  useEffect(() => {
    const wasInPos = prevInPosView.current;
    prevInPosView.current = inPosView;
    if (!wasInPos && inPosView) {
      // entering POS view → collapse
      setIsExpanded(false);
    } else if (wasInPos && !inPosView) {
      // leaving POS view → expand
      setIsExpanded(true);
    }
    // staying within the same zone → user preference preserved
  }, [inPosView]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, number>>({});
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFlyout = (id: string, top: number) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    itemRefs.current[id] = top;
    setHoveredItem(id);
  };

  const scheduleFlyoutHide = () => {
    hideTimerRef.current = setTimeout(() => setHoveredItem(null), 150);
  };

  const cancelFlyoutHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const buildMenu = (): MenuItem[] => [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: (a, sz = 16) => a
        ? <IcHomeFill size={sz} color={C.blue100} />
        : <IcHome size={sz} color={C.black60} />,
      hasSubmenu: false,
      onClick: () => onModeChange('Inicio'),
    },
    {
      id: 'puntodeventa',
      label: 'Punto de venta',
      icon: (a, sz = 16) => <Monitor size={sz} color={a ? C.blue100 : C.black60} strokeWidth={a ? 2.5 : 1.5} />,
      hasSubmenu: true,
      subItems: [
        { id: 'mesas',     label: 'Mesas',     icon: <IcMesas size={16} />,       active: activeMode === 'Mesas'     && pathname !== '/ventas', onClick: () => onModeChange('Mesas') },
        { id: 'mostrador', label: 'Mostrador', icon: <MostradorIcon size={16} />, active: activeMode === 'Mostrador' && pathname !== '/ventas', onClick: () => onModeChange('Mostrador') },
        { id: 'turnos',    label: 'Turnos',    icon: <IcTurnos size={16} />,      active: activeMode === 'Turnos'    && pathname !== '/ventas', onClick: () => onModeChange('Turnos') },
      ],
    },
    {
      id: 'ingresos',
      label: 'Ingresos',
      icon: (a, sz = 16) => <TrendingUp size={sz} color={a ? C.blue100 : C.black60} strokeWidth={a ? 2.5 : 1.5} />,
      hasSubmenu: true,
      subItems: [
        { id: 'ventas',       label: 'Ventas',             icon: <IcRecibos size={16} />,      active: pathname === '/ventas', onClick: () => navigate('/ventas') },
        { id: 'recibos',      label: 'Recibos',           icon: <IcRecibos size={16} />,      active: false, onClick: () => toast.info('Recibos') },
        { id: 'notascredito', label: 'Notas crédito',     icon: <IcNotasCredito size={16} />, active: false, onClick: () => toast.info('Notas crédito') },
        { id: 'notasdebito',  label: 'Notas débito',      icon: <IcNotasDebito size={16} />,  active: false, onClick: () => toast.info('Notas débito') },
      ],
    },
    {
      id: 'egresos',
      label: 'Egresos',
      icon: (a, sz = 16) => a
        ? <IcEgresosFill size={sz} color={C.blue100} />
        : <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" style={{ color: C.black60 }}><path d="M4 3h16v18l-2-1-2 1-2-1-2 1-2-1-2 1V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
      hasSubmenu: true,
      subItems: [
        { id: 'gastos',     label: 'Gastos',            icon: <IcGastos size={16} />,     active: false, onClick: () => toast.info('Gastos') },
        { id: 'docsoporte', label: 'Documento soporte', icon: <IcDocSoporte size={16} />, active: false, onClick: () => toast.info('Documento soporte') },
      ],
    },
    {
      id: 'items',
      label: 'Menú',
      icon: (a, sz = 16) => <UtensilsCrossed size={sz} color={a ? C.blue100 : C.black60} strokeWidth={a ? 2.5 : 1.5} />,
      hasSubmenu: true,
      subItems: [
        { id: 'listaitems',   label: 'Productos',                icon: <IcListaItems size={16} />,   active: false, onClick: () => toast.info('Productos') },
        { id: 'ajusteinv',    label: 'Ajuste de inventario',    icon: <IcAjusteInv size={16} />,    active: false, onClick: () => toast.info('Ajuste de inventario') },
        { id: 'flujoinv',     label: 'Flujo de inventario',     icon: <IcFlujoInv size={16} />,     active: false, onClick: () => toast.info('Flujo de inventario') },
        { id: 'variantesinv', label: 'Variantes de inventario', icon: <IcVariantesInv size={16} />, active: false, onClick: () => toast.info('Variantes de inventario') },
      ],
    },
    {
      id: 'contactos',
      label: 'Contactos',
      icon: (a, sz = 16) => a
        ? <IcUsuariosFill size={sz} color={C.blue100} />
        : <IcUsuarios size={sz} color={C.black60} />,
      hasSubmenu: false,
      onClick: () => toast.info('Contactos'),
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: (a, sz = 16) => a
        ? <IcReportesFill size={sz} color={C.blue100} />
        : <IcReportes size={sz} color={C.black60} />,
      hasSubmenu: false,
      onClick: () => onModeChange('Reportes'),
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      icon: (a, sz = 16) => a
        ? <IcAjustesFill size={sz} color={C.blue100} />
        : <IcAjustes size={sz} color={C.black60} />,
      hasSubmenu: false,
      onClick: () => toast.info('Ajustes'),
    },
    {
      id: 'chat',
      label: 'Chat con soporte',
      icon: (a, sz = 16) => a
        ? <IcChatFill size={sz} color={C.blue100} />
        : <IcChat size={sz} color={C.black60} />,
      hasSubmenu: false,
      onClick: () => toast.info('Chat con soporte'),
    },
  ];

  const menu = buildMenu();

  const isSectionActive = (item: MenuItem) => {
    if (item.id === 'inicio')       return activeMode === 'Inicio';
    if (item.id === 'puntodeventa') return (activeMode === 'Mesas' || activeMode === 'Mostrador' || activeMode === 'Turnos') && pathname !== '/ventas';
    if (item.id === 'reportes')     return activeMode === 'Reportes';
    if (item.id === 'ingresos')     return item.subItems?.some(sub => sub.active) || pathname === '/ventas' || pathname.startsWith('/ventas');
    // Generic: parent is active when any child is active
    if (item.subItems)              return item.subItems.some(sub => sub.active);
    return false;
  };

  // ── Collapsed state ──────────────────────────────────────────────────────

  if (!isExpanded) {
    return (
      <div style={{
        width: 60,
        alignSelf: 'stretch',
        flexShrink: 0,
        backgroundColor: C.white,
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        gap: 4,
        position: 'relative',
        zIndex: 20,
        overflowY: 'auto',
      }}>

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(true)}
          title="Expandir menú"
          style={{
            width: 24, height: 24, marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: 'pointer',
            color: C.blue100, flexShrink: 0,
          }}
        >
          <ChevronRight size={20} />
        </button>

        {/* Branch selector icon */}
        <div style={{
          width: 44, height: 32, marginBottom: 4,
          border: `1px solid ${C.blue20}`,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer',
        }}>
          <MapPin size={16} color={C.blue100} />
        </div>

        {/* Nueva venta */}
        <button
          onClick={() => onModeChange('Mesas')}
          title="Nueva venta"
          style={{
            width: 44, height: 32, marginBottom: 8,
            backgroundColor: C.blue100,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={16} color={C.white} />
        </button>

        {/* Icon-only menu items */}
        {menu.map(item => {
          const isActive = isSectionActive(item);

          return (
            <div
              key={item.id}
              style={{ position: 'relative', flexShrink: 0 }}
              onMouseEnter={e => showFlyout(item.id, e.currentTarget.getBoundingClientRect().top)}
              onMouseLeave={scheduleFlyoutHide}
            >
              <button
                onClick={() => {
                  if (!item.subItems && item.onClick) {
                    item.onClick();
                  }
                }}
                style={{
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: isActive && item.id !== 'puntodeventa' ? C.blue10 : 'transparent',
                  borderRadius: 8,
                }}>
                  {item.icon(isActive, 20)}
                </div>
              </button>

              {/* Dark tooltip for leaf items (hover) */}
              {hoveredItem === item.id && !item.subItems && (
                <div
                  style={{
                    position: 'fixed',
                    left: 68,
                    top: (itemRefs.current[item.id] ?? 0) + 6,
                    backgroundColor: C.black100,
                    borderRadius: 6,
                    padding: '6px 12px',
                    zIndex: 1000,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: 12, color: C.white, fontFamily: FONT, fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>
              )}

              {/* Flyout panel for parent items (hover-based) */}
              {hoveredItem === item.id && item.subItems && (
                <div
                  onMouseEnter={cancelFlyoutHide}
                  onMouseLeave={scheduleFlyoutHide}
                  style={{
                    position: 'fixed',
                    left: 68,
                    top: itemRefs.current[item.id] ?? 0,
                    backgroundColor: C.white,
                    borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    padding: 12,
                    zIndex: 300,
                    minWidth: 180,
                  }}
                >
                  <p style={{
                    fontSize: 11, fontWeight: 700, color: C.black60,
                    fontFamily: FONT, padding: '4px 8px',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}>
                    {item.label}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {item.subItems.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => { sub.onClick(); setHoveredItem(null); }}
                        style={{
                          textAlign: 'left', width: '100%',
                          padding: '6px 8px', borderRadius: 8,
                          fontSize: 14, fontWeight: sub.active ? 600 : 500,
                          color: sub.active ? C.blue100 : C.black100,
                          backgroundColor: sub.active ? C.blue10 : 'transparent',
                          display: 'flex', alignItems: 'center',
                          border: 'none', cursor: 'pointer',
                          fontFamily: FONT, lineHeight: '20px',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseOver={e => { if (!sub.active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue10; }}
                        onMouseOut={e => { if (!sub.active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Expanded state ────────────────────────────────────────────────────────

  return (
    <div style={{
      width: 212,
      alignSelf: 'stretch',
      flexShrink: 0,
      backgroundColor: C.white,
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 16,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
      position: 'relative',
      zIndex: 20,
      overflow: 'hidden',
    }}>

      {/* ── Header: company info ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        paddingLeft: 8, flexShrink: 0, marginBottom: 18,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: C.blue100,
            fontFamily: FONT, lineHeight: '20px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Rafael Arango
          </div>
          <div style={{
            fontSize: 11, fontWeight: 400, color: C.black40,
            fontFamily: FONT, lineHeight: '14px',
          }}>
            Administrador
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          title="Colapsar menú"
          style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', cursor: 'pointer',
            color: C.blue100, flexShrink: 0,
          }}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* ── Branch selector + Nueva venta ── */}
      <div style={{ flexShrink: 0, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button style={{
          width: 194, height: 32,
          border: `1px solid ${C.blue20}`,
          borderRadius: 100,
          padding: 8,
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: C.white, cursor: 'pointer',
        }}>
          <MapPin size={16} color={C.blue100} style={{ flexShrink: 0 }} />
          <span style={{
            flex: 1, textAlign: 'left',
            fontSize: 12, fontWeight: 600, color: C.blue100,
            fontFamily: FONT, lineHeight: '16px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Principal
          </span>
          <ChevronDown size={16} color={C.blue100} style={{ flexShrink: 0 }} />
        </button>

        <button
          onClick={() => onModeChange('Mesas')}
          style={{
            width: 196, height: 40,
            backgroundColor: C.blue100,
            borderRadius: 12,
            padding: '8px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, border: 'none', cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Plus size={24} color={C.white} />
          <span style={{
            fontSize: 14, fontWeight: 700, color: C.white,
            fontFamily: FONT, lineHeight: '20px',
          }}>
            Nueva venta
          </span>
        </button>
      </div>

      {/* ── Menu items ── */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        scrollbarWidth: 'none' as const,
      }}>
        {menu.map((item, index) => {
          const isActive = isSectionActive(item);
          const isOpen = openSections.has(item.id);
          const prev = menu[index - 1];
          // Show divider before any category group and before the first standalone item block
          const showDivider = index > 0 && (
            item.hasSubmenu || (!item.hasSubmenu && prev?.hasSubmenu)
          );

          return (
            <div key={item.id}>
              {showDivider && (
                <div style={{ height: 1, backgroundColor: '#E8E9F0', margin: '8px 4px' }} />
              )}

              {item.hasSubmenu ? (
                <>
                  {/* Category header */}
                  <button
                    onClick={() => toggleSection(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px',
                      background: isActive && item.id !== 'puntodeventa' ? C.blue10 : 'none',
                      border: 'none', cursor: 'pointer',
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon(isActive)}
                    </span>
                    <span style={{
                      flex: 1, textAlign: 'left',
                      fontSize: 14, fontWeight: isActive ? 600 : 500,
                      color: isActive ? C.blue100 : C.black100,
                      fontFamily: FONT, lineHeight: '20px',
                    }}>
                      {item.label}
                    </span>
                    <ChevronDown
                      size={14}
                      color={isActive ? C.blue100 : C.black60}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>

                  {/* Subitems — text only, no icons */}
                  {isOpen && item.subItems && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {item.subItems.map(sub => (
                        <button
                          key={sub.id}
                          onClick={sub.onClick}
                          style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center',
                            paddingLeft: 36, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
                            borderRadius: 8,
                            backgroundColor: sub.active ? C.blue10 : 'transparent',
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseOver={e => { if (!sub.active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue10; }}
                          onMouseOut={e => { if (!sub.active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                        >
                          <span style={{
                            fontSize: 13, fontWeight: sub.active ? 600 : 500,
                            color: sub.active ? C.blue100 : C.black100,
                            fontFamily: FONT, lineHeight: '20px',
                          }}>
                            {sub.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Direct item — icon + label, no chevron */
                <button
                  onClick={item.onClick}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px', borderRadius: 8,
                    backgroundColor: isActive ? C.blue10 : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseOver={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.blue10; }}
                  onMouseOut={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon(isActive)}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: isActive ? 600 : 500,
                    color: isActive ? C.blue100 : C.black100,
                    fontFamily: FONT, lineHeight: '20px',
                  }}>
                    {item.label}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  activeMode: 'Mesas' | 'Mostrador' | 'Reportes' | 'Inicio' | 'Turnos';
  onModeChange: (mode: 'Mesas' | 'Mostrador' | 'Reportes' | 'Inicio' | 'Turnos') => void;
  onLogoutRequest?: () => void;
}

export function BoldTopBar({ activeMode, onModeChange, onLogoutRequest }: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  const handleAvatarClick = useCallback(() => {
    if (!showProfileMenu && avatarBtnRef.current) {
      const rect = avatarBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(window.innerWidth - rect.right, 16),
      });
    }
    setShowProfileMenu(v => !v);
  }, [showProfileMenu]);

  return (
    <div style={{
      height: 60,
      width: '100%',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 16,
      paddingRight: 16,
      background: 'transparent',
      position: 'relative',
      zIndex: 30,
    }}>
      {/* ── Left: Logo + mode toggle (only in POS view) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <BoldLogo />
      </div>

      {/* ── Right: business info + bell + avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1729' }}>Restaurante Demo</span>
          <span style={{ fontSize: 14, color: '#6B7280', margin: '0 4px' }}>—</span>
          <span style={{ fontSize: 14, color: '#6B7280' }}>Plan Plus</span>
        </div>
        <button
          style={{ color: '#6B7280', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          className="hover:text-gray-900 transition-colors"
          title="Notificaciones"
        >
          <Bell size={24} />
        </button>
        <button
          ref={avatarBtnRef}
          onClick={handleAvatarClick}
          title="Perfil"
          style={{
            width: 40, height: 40, borderRadius: '50%',
            backgroundColor: '#0F1729',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: 'none', cursor: 'pointer',
            outline: showProfileMenu ? '3px solid rgba(59,130,246,0.35)' : 'none',
            outlineOffset: 2, transition: 'outline 0.15s',
          }}
        >
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>RA</span>
        </button>
      </div>

      {/* ── Profile dropdown ── */}
      {showProfileMenu && menuPos && ReactDOM.createPortal(
        <>
          <div
            onClick={() => setShowProfileMenu(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9000 }}
          />
          <div style={{
            position: 'fixed', top: menuPos.top, right: menuPos.right,
            width: 220, zIndex: 9001,
          }}>
            <div style={{
              position: 'absolute', top: -8, right: 12,
              width: 0, height: 0,
              borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
              borderBottom: '8px solid #fff',
              filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.06))', zIndex: 1,
            }} />
            <div style={{
              backgroundColor: '#fff', borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #F3F4F6', overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', backgroundColor: '#0F1729',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12, flexShrink: 0,
                }}>
                  <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>RA</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#0F1729', textAlign: 'center', lineHeight: 1.3 }}>
                  Ramiro Ramos
                </span>
              </div>
              <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />
              <div style={{ padding: '8px 8px' }}>
                <button
                  onClick={() => { toast.info('Legal y privacidad'); setShowProfileMenu(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 8px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <Shield size={20} color="#6B7280" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#0F1729' }}>Legal y privacidad</span>
                </button>
                <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '4px 0' }} />
                <button
                  onClick={() => { setShowProfileMenu(false); onLogoutRequest?.(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 8px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <LogOut size={20} color="#6B7280" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#0F1729' }}>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
