/**
 * ComboComponentsCard — card "Ítems del combo" del formulario de ítem (pestaña Combo).
 * Hermana estructural de DisponibilidadCard: 100% controlada (todo el estado
 * vive en el FormState de ItemFormPage), salvo el texto del buscador local.
 *
 * Los componentes referencian ALL_CATALOG_PRODUCTS (el catálogo que
 * efectivamente venden Mostrador/Mesas), no otros Items — ver
 * specs/2026-09-combos.md §5.2.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Trash2, ChevronDown } from 'lucide-react';
import type { ItemComboComponente } from '../../types/item';
import { useCatalog, useVertical } from '../../vertical';
import { componentKey, isCustomComponentItem } from '../../utils/comboBridge';
import { useItems } from '../../store/itemsStore';
import { useProductVariants } from '../../store/variantesStore';
import { FieldLabel } from './FormField';

interface ComboComponentsCardProps {
  componentes: ItemComboComponente[];
  onAdd: (ref: { productId?: number; itemId?: string; variantId?: string }) => void;
  /** `key` = variantId ?? String(productId). */
  onChangeCantidad: (key: string, cantidad: number) => void;
  onRemove: (key: string) => void;
  /** "+ Crear nuevo ítem" del desplegable — abre el drawer de creación de ítem. */
  onCreateItem: () => void;
}

/** Máximo de resultados del buscador (con o sin texto). */
const MAX_RESULTS = 30;

const keyOf = componentKey;

/** Candidato del buscador: un producto del catálogo o un Item creado por el usuario. */
interface Opt {
  key: string;
  name: string;
  price: number;
  productId?: number;
  itemId?: string;
}

/** Nombre, precio y variante de un componente agregado + suma de los ítems (la comparte la card de precio). */
export function useComboResolver() {
  const { items } = useItems();
  const { allProducts: ALL_CATALOG_PRODUCTS } = useCatalog();
  const productVariants = useProductVariants();
  const { has } = useVertical();
  const variantsOf = (productId: number) => (has('variantes') ? productVariants[productId] : undefined);
  const resolve = (c: ItemComboComponente) => {
    if (c.itemId) {
      const it = items.find(i => i.id === c.itemId);
      return { name: it?.nombre, price: it?.precioTotal ?? 0, pv: undefined, v: undefined };
    }
    const p = ALL_CATALOG_PRODUCTS.find(x => x.id === c.productId);
    const pv = c.productId !== undefined ? variantsOf(c.productId) : undefined;
    const v = c.variantId ? pv?.variantes.find(x => x.id === c.variantId) : undefined;
    return { name: p?.name, price: v?.price ?? p?.price ?? 0, pv, v };
  };
  const sumOf = (componentes: ItemComboComponente[]) =>
    componentes.reduce((acc, c) => acc + resolve(c).price * c.cantidad, 0);
  // Costo de un componente: el del Item propio, o el del Item sembrado del producto del catálogo
  // (una variante usa el costo de su producto, que no tiene costo propio).
  const costOf = (c: ItemComboComponente) => {
    if (c.itemId) return items.find(i => i.id === c.itemId)?.costo ?? 0;
    const seed = items.find(i => i.catalogProductId === c.productId || i.id === `seed-${c.productId}`);
    return seed?.costo ?? 0;
  };
  const costSumOf = (componentes: ItemComboComponente[]) =>
    componentes.reduce((acc, c) => acc + costOf(c) * c.cantidad, 0);
  return { resolve, sumOf, costSumOf };
}

export function ComboComponentsCard({
  componentes,
  onAdd,
  onChangeCantidad,
  onRemove,
  onCreateItem,
}: ComboComponentsCardProps) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { items } = useItems();
  const { allProducts: ALL_CATALOG_PRODUCTS } = useCatalog();
  const productVariants = useProductVariants();
  const { has } = useVertical();
  const variantsOf = (productId: number) => (has('variantes') ? productVariants[productId] : undefined);
  const closeSearch = () => { setQuery(''); setOpen(false); setExpandedId(null); };

  const selectedKeys = new Set(componentes.map(keyOf));
  // Candidatos ordenados del Item guardado más reciente al más antiguo. Los Items sembrados enlazan con su
  // producto del catálogo por catalogProductId (Retail) o por id 'seed-<productId>'; los Items creados por
  // el usuario entran directo (ver isCustomComponentItem). Los productos sin Item van al final.
  const options = useMemo(() => {
    const byId = new Map(ALL_CATALOG_PRODUCTS.map(p => [p.id, p]));
    const seen = new Set<number>();
    const out: Opt[] = [];
    for (const i of [...items].sort((a, b) => b.creadoEn - a.creadoEn)) {
      if (isCustomComponentItem(i)) {
        out.push({ key: `item:${i.id}`, name: i.nombre, price: i.precioTotal, itemId: i.id });
        continue;
      }
      const productId = i.catalogProductId ?? Number(/^seed-(\d+)$/.exec(i.id)?.[1]);
      const p = byId.get(productId);
      if (!p || seen.has(p.id)) continue;
      seen.add(p.id);
      out.push({ key: String(p.id), name: p.name, price: p.price, productId: p.id });
    }
    for (const p of ALL_CATALOG_PRODUCTS) {
      if (!seen.has(p.id)) out.push({ key: String(p.id), name: p.name, price: p.price, productId: p.id });
    }
    return out;
  }, [items, ALL_CATALOG_PRODUCTS]);

  const hasQuery = query.trim().length > 0;
  const results = open || hasQuery
    ? options
        .filter(o => {
          if (hasQuery && !o.name.toLowerCase().includes(query.toLowerCase())) return false;
          const pv = o.productId !== undefined ? variantsOf(o.productId) : undefined;
          // Con variantes: se oculta solo cuando ya están todas agregadas.
          return pv ? pv.variantes.some(v => !selectedKeys.has(v.id)) : !selectedKeys.has(o.key);
        })
        .slice(0, MAX_RESULTS)
    : [];

  // Cierra el desplegable al hacer clic fuera del buscador o con Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const { resolve, sumOf } = useComboResolver();
  const sumaIndividual = sumOf(componentes);

  return (
    <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Ítems del combo</h3>

      {/* Buscador */}
      <div ref={searchRef}>
        <FieldLabel required>Ítems incluidos</FieldLabel>
        <div style={{ position: 'relative' }}>
          <ChevronDown size={18} color="var(--blue-100)" style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, pointerEvents: 'none' }} />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Busca un ítem por nombre"
            className="merlin-input-filled"
            style={{ paddingRight: 40 }}
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '6px 0 0' }}>Agrega mínimo 2 ítems.</p>
        {results.length > 0 && (
          <div style={{ marginTop: 8, border: '1px solid var(--black-10)', borderRadius: 8, maxHeight: 360, overflowY: 'auto' }}>
            <button
              type="button"
              onClick={() => { closeSearch(); onCreateItem(); }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', background: 'none', border: 'none',
                borderBottom: '1px solid var(--black-10)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: 'var(--blue-100)', textDecoration: 'underline', fontFamily: "'Montserrat', sans-serif",
              }}
            >
              + Crear nuevo ítem
            </button>
            {results.map(o => {
              const pv = o.productId !== undefined ? variantsOf(o.productId) : undefined;
              const rowStyle: React.CSSProperties = {
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', background: 'none', border: 'none', borderBottom: '1px solid var(--black-10)',
                cursor: 'pointer', textAlign: 'left', fontFamily: "'Montserrat', sans-serif",
              };
              if (!pv) {
                return (
                  <button key={o.key} type="button" onClick={() => { onAdd({ productId: o.productId, itemId: o.itemId }); closeSearch(); }} style={rowStyle}>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--black-100)' }}>{o.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-100)' }}>${o.price.toLocaleString('es-CO')}</span>
                    </span>
                  </button>
                );
              }
              const open = expandedId === o.productId;
              const desde = Math.min(...pv.variantes.map(v => v.price));
              return (
                <div key={o.key}>
                  <button type="button" onClick={() => setExpandedId(open ? null : o.productId!)} style={rowStyle} aria-expanded={open}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black-100)' }}>{o.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--black-40)' }}>
                      {pv.variantes.length} variantes · desde ${desde.toLocaleString('es-CO')}
                      <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : undefined }} />
                    </span>
                  </button>
                  {open && (
                    <div style={{ backgroundColor: 'var(--black-0)', borderBottom: '1px solid var(--black-10)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.4fr 0.8fr', gap: 8, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--black-60)' }}>
                        <span>Variante</span><span>Precio de venta</span><span>Código</span><span>Existencia</span>
                      </div>
                      {pv.variantes.map(v => {
                        const taken = selectedKeys.has(v.id);
                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={taken}
                            onClick={() => { onAdd({ productId: o.productId, variantId: v.id }); closeSearch(); }}
                            style={{
                              width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.4fr 0.8fr', gap: 8,
                              padding: '8px 12px', background: 'none', border: 'none', borderTop: '1px solid var(--black-10)',
                              cursor: taken ? 'not-allowed' : 'pointer', opacity: taken ? 0.4 : 1, textAlign: 'left',
                              fontSize: 12, color: 'var(--black-100)', fontFamily: "'Montserrat', sans-serif",
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{v.label}{taken && ' · agregada'}</span>
                            <span>${v.price.toLocaleString('es-CO')}</span>
                            <span>{v.codigo}</span>
                            <span>{v.existencia}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lista de seleccionados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {componentes.map(c => {
          const { name, price, pv, v } = resolve(c);
          const falta = !!pv && !v;
          const key = keyOf(c);
          return (
            <div
              key={key}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                border: '1px solid var(--black-10)', borderRadius: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {name ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--black-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </div>
                    {v && (
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-100)' }}>{v.label} · {v.codigo}</div>
                    )}
                    {falta && (
                      <div style={{ fontSize: 12, color: 'var(--coral-100)' }}>Selecciona una variante (quita y vuelve a agregar)</div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--black-40)' }}>${price.toLocaleString('es-CO')} ( {c.cantidad} un )</div>
                  </>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--black-40)', fontStyle: 'italic' }}>
                    Producto no encontrado
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--black-10)', borderRadius: 6, height: 28, overflow: 'hidden', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => onChangeCantidad(key, Math.max(1, c.cantidad - 1))}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)' }}
                >
                  <Minus size={13} />
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--black-100)' }}>
                  {c.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeCantidad(key, c.cantidad + 1)}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)' }}
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemove(key)}
                aria-label="Quitar ítem"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-40)', flexShrink: 0 }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Suma de los ítems — informativo, no afecta el precio guardado */}
      {componentes.length > 0 && (
        <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--black-100)' }}>
          <span>Suma de los ítems</span>
          <span>${sumaIndividual.toLocaleString('es-CO')}</span>
        </div>
      )}
    </div>
  );
}
