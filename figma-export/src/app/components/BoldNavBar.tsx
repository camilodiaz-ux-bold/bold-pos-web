import React, { useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  Home, Bell, Settings, ChevronLeft, ChevronRight,
  ChevronDown, Plus, MapPin, Tag, BarChart2, Clock, ClipboardList,
  Monitor, Package, Shield, LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import svgPaths from '../../imports/svg-5yr7pr5zvq';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavBarProps {
  activeMode: 'Mesas' | 'Mostrador' | 'Reportes';
  onModeChange: (mode: 'Mesas' | 'Mostrador' | 'Reportes') => void;
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
  icon: React.ReactNode;
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

/**
 * Mesa icon: front view of a restaurant table with 2 chairs on each side.
 * Left chair: backrest + seat. Table: wide top + 2 legs. Right chair: mirrored.
 */
function MesaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* ── Table surface ── */}
      <rect x="3.5" y="8" width="13" height="2" rx="1" />
      {/* Table left leg */}
      <rect x="5" y="10" width="1.5" height="4.5" rx="0.75" />
      {/* Table right leg */}
      <rect x="13.5" y="10" width="1.5" height="4.5" rx="0.75" />

      {/* ── Left chair ── */}
      {/* Backrest */}
      <rect x="0.5" y="5" width="1.5" height="6.5" rx="0.75" />
      {/* Seat */}
      <rect x="0.5" y="8.5" width="3.5" height="1.5" rx="0.75" />
      {/* Front leg */}
      <rect x="3" y="10" width="1" height="4.5" rx="0.5" />

      {/* ── Right chair ── */}
      {/* Backrest */}
      <rect x="18" y="5" width="1.5" height="6.5" rx="0.75" />
      {/* Seat */}
      <rect x="16" y="8.5" width="3.5" height="1.5" rx="0.75" />
      {/* Front leg */}
      <rect x="16" y="10" width="1" height="4.5" rx="0.5" />
    </svg>
  );
}

/** Mostrador icon: front view of counter with staff silhouette */
function MostradorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Person head */}
      <circle cx="10" cy="4.5" r="2.3" />
      {/* Shoulders arc */}
      <ellipse cx="10" cy="9.2" rx="3.5" ry="1.2" />
      {/* Counter top surface */}
      <rect x="1" y="11" width="18" height="2.2" rx="1.1" />
      {/* Counter front panel */}
      <rect x="2" y="13.2" width="16" height="4.3" rx="1" />
    </svg>
  );
}

// ─── Active indicator bar ─────────────────────────────────────────────────────

function ActiveBar({ height = 20 }: { height?: number }) {
  return (
    <span style={{
      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
      width: 3, height, backgroundColor: '#3B82F6', borderRadius: '0 2px 2px 0',
    }} />
  );
}

// ─── Main NavBar component ────────────────────────────────────────────────────

export function BoldNavBar({ activeMode, onModeChange }: NavBarProps) {
  // Collapsed by default to maximise content area
  const [isExpanded, setIsExpanded] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['operacion']));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, number>>({});
  // Hover bridge: delay hiding the flyout so mouse can travel from icon → card
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFlyout = (id: string, top: number) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    itemRefs.current[id] = top;
    setHoveredItem(id);
  };

  const scheduleFlyoutHide = () => {
    hideTimerRef.current = setTimeout(() => setHoveredItem(null), 120);
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
      id: 'home', label: 'HOME', icon: <Home size={20} />, hasSubmenu: false,
    },
    {
      id: 'operacion', label: 'OPERACIÓN', icon: <Monitor size={20} />, hasSubmenu: true,
      subItems: [
        { id: 'mesas',     label: 'Mesas',     icon: <MesaIcon size={14} />,     active: activeMode === 'Mesas',     onClick: () => onModeChange('Mesas') },
        { id: 'mostrador', label: 'Mostrador', icon: <MostradorIcon size={14} />, active: activeMode === 'Mostrador', onClick: () => onModeChange('Mostrador') },
        { id: 'turnos',    label: 'Turnos',    icon: <Clock size={14} />,          active: false,                       onClick: () => toast.info('Módulo Turnos') },
      ],
    },
    {
      id: 'cocina', label: 'COCINA', icon: <Bell size={20} />, hasSubmenu: true,
      subItems: [
        { id: 'comandas', label: 'Comandas', icon: <ClipboardList size={14} />, active: false, onClick: () => toast.info('Módulo Comandas') },
      ],
    },
    {
      id: 'catalogo', label: 'CATÁLOGO', icon: <Tag size={20} />, hasSubmenu: true,
      subItems: [
        { id: 'productos',  label: 'Productos',  icon: <Package size={14} />, active: false, onClick: () => toast.info('Módulo Productos') },
        { id: 'categorias', label: 'Categorías', icon: <Tag size={14} />,     active: false, onClick: () => toast.info('Módulo Categorías') },
      ],
    },
    {
      id: 'reportes', label: 'Reportes', icon: <BarChart2 size={20} />, hasSubmenu: false,
      onClick: () => onModeChange('Reportes'),
    },
  ];

  const menu = buildMenu();

  // ── Collapsed state ──────────────────────────────────────────────────────

  if (!isExpanded) {
    return (
      <div style={{
        width: 64,
        alignSelf: 'stretch',
        flexShrink: 0,
        backgroundColor: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(true)}
          title="Expandir menú"
          style={{ padding: 10, borderRadius: 8, color: '#6B7280', marginBottom: 8, border: 'none', background: 'none', cursor: 'pointer' }}
          className="hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Nuevo pedido — red circle */}
        <button
          onClick={() => toast.info('Nuevo pedido')}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            backgroundColor: '#E63946',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, flexShrink: 0,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(230,57,70,0.35)',
          }}
          className="hover:bg-red-600 transition-colors"
        >
          <Plus size={20} color="#fff" />
        </button>

        {/* Icon-only menu items */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {menu.map(item => {
            const isItemActive = item.id === 'operacion'
              ? (activeMode === 'Mesas' || activeMode === 'Mostrador')
              : item.id === 'reportes'
              ? activeMode === 'Reportes'
              : false;

            return (
              <div
                key={item.id}
                style={{ position: 'relative', width: '100%' }}
                onMouseEnter={e => showFlyout(item.id, e.currentTarget.getBoundingClientRect().top)}
                onMouseLeave={scheduleFlyoutHide}
              >
                <button
                  onClick={() => {
                    if (item.onClick) { item.onClick(); setHoveredItem(null); }
                  }}
                  style={{
                    width: '100%', padding: '14px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isItemActive ? '#3B82F6' : '#374151',
                    position: 'relative', border: 'none', background: isItemActive ? '#EFF6FF' : 'none', cursor: 'pointer',
                  }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {isItemActive && <ActiveBar />}
                  {item.icon}
                </button>

                {/* Flyout tooltip — gap reduced to 4px; mouse-enter cancels hide timer */}
                {hoveredItem === item.id && (
                  <div
                    onMouseEnter={cancelFlyoutHide}
                    onMouseLeave={scheduleFlyoutHide}
                    style={{
                      position: 'fixed',
                      left: 68,
                      top: itemRefs.current[item.id] ?? 0,
                      backgroundColor: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
                      border: '1px solid #F3F4F6',
                      padding: 12,
                      zIndex: 1000,
                      minWidth: 160,
                    }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0F1729', marginBottom: item.subItems?.length ? 8 : 0 }}>
                      {item.label}
                    </p>
                    {item.subItems && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {item.subItems.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => { sub.onClick(); setHoveredItem(null); }}
                            style={{
                              textAlign: 'left', width: '100%',
                              padding: '6px 8px', borderRadius: 6,
                              fontSize: 12, fontWeight: sub.active ? 600 : 400,
                              color: sub.active ? '#3B82F6' : '#374151',
                              backgroundColor: sub.active ? '#EFF6FF' : 'transparent',
                              display: 'flex', alignItems: 'center', gap: 6,
                              border: 'none', cursor: 'pointer',
                            }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {sub.icon} {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ajustes at bottom */}
        <div style={{ borderTop: '1px solid #F3F4F6', width: 40, marginBottom: 4 }} />
        <button
          style={{ padding: '12px 0', color: '#374151', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
          className="hover:bg-gray-50 transition-colors"
          title="Ajustes"
        >
          <Settings size={20} />
        </button>
      </div>
    );
  }

  // ── Expanded state ────────────────────────────────────────────────────────

  return (
    <div style={{
      width: 240,
      alignSelf: 'stretch',
      flexShrink: 0,
      backgroundColor: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 20,
      overflow: 'hidden',
    }}>

      {/* ── Header: user info ── */}
      <div style={{ padding: 16, borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1729' }}>Ramiro Ramos</span>
          <button
            onClick={() => setIsExpanded(false)}
            title="Colapsar menú"
            style={{ padding: 4, borderRadius: 6, color: '#6B7280', flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            className="hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Administrador</span>
      </div>

      {/* ── Branch selector ── */}
      <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
        <button
          style={{
            width: '100%', backgroundColor: '#F3F4F6',
            borderRadius: 8, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
            border: 'none', cursor: 'pointer',
          }}
          className="hover:bg-gray-200 transition-colors"
        >
          <MapPin size={14} color="#6B7280" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 500, color: '#0F1729' }}>Sede Centro</span>
          <ChevronDown size={14} color="#6B7280" />
        </button>
      </div>

      {/* ── Nuevo pedido button ── */}
      <div style={{ padding: '10px 16px 16px', flexShrink: 0 }}>
        <button
          onClick={() => toast.info('Nuevo pedido')}
          style={{
            width: '100%', backgroundColor: '#E63946',
            borderRadius: 8, padding: '12px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(230,57,70,0.30)',
          }}
          className="hover:bg-red-600 transition-colors"
        >
          <Plus size={18} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Nuevo pedido</span>
        </button>
      </div>

      {/* ── Menu items ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {menu.map(item => {
          const isItemActive = item.id === 'operacion'
            ? (activeMode === 'Mesas' || activeMode === 'Mostrador')
            : item.id === 'reportes'
            ? activeMode === 'Reportes'
            : false;
          const isOpen = openSections.has(item.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => item.hasSubmenu ? toggleSection(item.id) : item.onClick ? item.onClick() : toast.info(item.label)}
                style={{
                  width: '100%', position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', textAlign: 'left',
                  color: isItemActive ? '#3B82F6' : '#374151',
                  backgroundColor: isItemActive && !item.hasSubmenu ? '#EFF6FF' : 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
                className="hover:bg-gray-50 transition-colors"
              >
                {isItemActive && !item.hasSubmenu && <ActiveBar />}
                <span style={{ color: isItemActive ? '#3B82F6' : '#374151', display: 'flex' }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronDown
                    size={14}
                    style={{
                      color: '#9CA3AF',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                )}
              </button>

              {/* Subitems */}
              {item.hasSubmenu && isOpen && item.subItems && (
                <div>
                  {item.subItems.map(sub => (
                    <button
                      key={sub.id}
                      onClick={sub.onClick}
                      style={{
                        width: '100%', position: 'relative',
                        display: 'flex', alignItems: 'center', gap: 8,
                        paddingLeft: 40, paddingRight: 16,
                        paddingTop: 10, paddingBottom: 10,
                        textAlign: 'left',
                        color: sub.active ? '#3B82F6' : '#374151',
                        backgroundColor: sub.active ? '#EFF6FF' : 'transparent',
                        border: 'none', cursor: 'pointer',
                      }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {sub.active && (
                        <span style={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          width: 3, height: 16, backgroundColor: '#3B82F6', borderRadius: '0 2px 2px 0',
                        }} />
                      )}
                      <span style={{ color: sub.active ? '#3B82F6' : '#9CA3AF', display: 'flex' }}>{sub.icon}</span>
                      <span style={{ fontSize: 13 }}>{sub.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Ajustes (bottom) ── */}
      <div style={{ borderTop: '1px solid #F3F4F6', margin: '0 16px', flexShrink: 0 }} />
      <button
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', color: '#374151', width: '100%', textAlign: 'left',
          flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer',
        }}
        className="hover:bg-gray-50 transition-colors"
      >
        <Settings size={20} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Ajustes</span>
      </button>
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  activeMode: 'Mesas' | 'Mostrador' | 'Reportes';
  onModeChange: (mode: 'Mesas' | 'Mostrador' | 'Reportes') => void;
  onLogoutRequest?: () => void;
}

export function BoldTopBar({ activeMode, onModeChange, onLogoutRequest }: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // Store the calculated fixed position to avoid clipping by overflow:hidden parents
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  const handleAvatarClick = useCallback(() => {
    if (!showProfileMenu && avatarBtnRef.current) {
      const rect = avatarBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        // right offset from viewport right edge, min 16px from edge
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
      {/* ── Left: Logo + mode toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <BoldLogo />

        {/* Segmented icon control */}
        <div style={{
          backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4,
          display: 'flex', gap: 2,
        }}>
          {/* Mesas button */}
          <button
            onClick={() => onModeChange('Mesas')}
            title="Vista Mesas — servicio a la mesa"
            style={{
              padding: 8, borderRadius: 6,
              backgroundColor: activeMode === 'Mesas' ? '#fff' : 'transparent',
              boxShadow: activeMode === 'Mesas' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              color: activeMode === 'Mesas' ? '#0F1729' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              border: 'none', cursor: 'pointer',
            }}
          >
            <MesaIcon size={20} />
          </button>
          {/* Mostrador button */}
          <button
            onClick={() => onModeChange('Mostrador')}
            title="Vista Mostrador — venta rápida"
            style={{
              padding: 8, borderRadius: 6,
              backgroundColor: activeMode === 'Mostrador' ? '#fff' : 'transparent',
              boxShadow: activeMode === 'Mostrador' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              color: activeMode === 'Mostrador' ? '#0F1729' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
              border: 'none', cursor: 'pointer',
            }}
          >
            <MostradorIcon size={20} />
          </button>
        </div>
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

        {/* Avatar button */}
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
            outlineOffset: 2,
            transition: 'outline 0.15s',
          }}
        >
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>RA</span>
        </button>
      </div>

      {/* ── Profile dropdown — rendered via fixed position to avoid overflow clipping ── */}
      {showProfileMenu && menuPos && ReactDOM.createPortal(
        <>
          {/* Backdrop — closes menu on outside click */}
          <div
            onClick={() => setShowProfileMenu(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9000 }}
          />

          {/* Dropdown wrapper — allows triangle to overflow above card */}
          <div style={{
            position: 'fixed',
            top: menuPos.top,
            right: menuPos.right,
            width: 220,
            zIndex: 9001,
          }}>
            {/* Triangle arrow pointing up, aligned near avatar center */}
            <div style={{
              position: 'absolute',
              top: -8,
              right: 12,
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #fff',
              filter: 'drop-shadow(0 -2px 2px rgba(0,0,0,0.06))',
              zIndex: 1,
            }} />

            {/* Card */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid #F3F4F6',
              overflow: 'hidden',
            }}>
              {/* Profile header */}
              <div style={{ padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  backgroundColor: '#0F1729',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12, flexShrink: 0,
                }}>
                  <span style={{ color: '#fff', fontSize: 20, fontWeight: 600 }}>RA</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#0F1729', textAlign: 'center', lineHeight: 1.3 }}>
                  Ramiro Ramos
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />

              {/* Options */}
              <div style={{ padding: '8px 8px' }}>
                {/* Legal y privacidad */}
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

                {/* Divider */}
                <div style={{ height: 1, backgroundColor: '#E5E7EB', margin: '4px 0' }} />

                {/* Cerrar sesión */}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogoutRequest?.();
                  }}
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