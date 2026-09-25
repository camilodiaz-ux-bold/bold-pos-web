/**
 * ComboComponentsCard — card "Componentes del combo" del formulario de ítem.
 * Hermana estructural de DisponibilidadCard: 100% controlada (todo el estado
 * vive en el FormState de ItemFormPage), salvo el texto del buscador local.
 *
 * Los componentes referencian ALL_CATALOG_PRODUCTS (el catálogo que
 * efectivamente venden Mostrador/Mesas), no otros Items — ver
 * specs/2026-09-combos.md §5.2.
 */
import React, { useState } from 'react';
import { Search, Minus, Plus, X } from 'lucide-react';
import type { ItemComboComponente } from '../../types/item';
import { ALL_CATALOG_PRODUCTS } from '../../data/productCatalog';
import { FieldLabel } from './FormField';

interface ComboComponentsCardProps {
  componentes: ItemComboComponente[];
  onAdd: (productId: number) => void;
  onChangeCantidad: (productId: number, cantidad: number) => void;
  onRemove: (productId: number) => void;
  precioTotal: number;
  error?: string;
}

export function ComboComponentsCard({
  componentes,
  onAdd,
  onChangeCantidad,
  onRemove,
  precioTotal,
  error,
}: ComboComponentsCardProps) {
  const [query, setQuery] = useState('');

  const selectedIds = new Set(componentes.map(c => c.productId));
  const results = query.trim().length > 0
    ? ALL_CATALOG_PRODUCTS
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) && !selectedIds.has(p.id))
        .slice(0, 6)
    : [];

  const sumaIndividual = componentes.reduce((acc, c) => {
    const p = ALL_CATALOG_PRODUCTS.find(x => x.id === c.productId);
    return acc + (p ? p.price * c.cantidad : 0);
  }, 0);
  const ahorro = sumaIndividual - precioTotal;

  return (
    <div style={{ backgroundColor: 'var(--black-0)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Componentes del combo</h3>

      {/* Buscador */}
      <div>
        <FieldLabel required>Agregar productos</FieldLabel>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--black-40)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busca un producto del catálogo"
            className="merlin-input-filled"
            style={{ paddingLeft: 36 }}
          />
        </div>
        {results.length > 0 && (
          <div style={{ marginTop: 8, border: '1px solid var(--black-10)', borderRadius: 8, overflow: 'hidden' }}>
            {results.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => { onAdd(p.id); setQuery(''); }}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', background: 'none', border: 'none', borderBottom: '1px solid var(--black-10)',
                  cursor: 'pointer', textAlign: 'left', fontFamily: "'Montserrat', sans-serif",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black-100)' }}>{p.name}</span>
                <span style={{ fontSize: 12, color: 'var(--black-40)' }}>${p.price.toLocaleString('es-CO')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de seleccionados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {componentes.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--black-40)', margin: 0 }}>Aún no agregaste ningún producto.</p>
        )}
        {componentes.map(c => {
          const p = ALL_CATALOG_PRODUCTS.find(x => x.id === c.productId);
          return (
            <div
              key={c.productId}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                border: '1px solid var(--black-10)', borderRadius: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {p ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--black-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--black-40)' }}>${p.price.toLocaleString('es-CO')} c/u</div>
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
                  onClick={() => onChangeCantidad(c.productId, Math.max(1, c.cantidad - 1))}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)' }}
                >
                  <Minus size={13} />
                </button>
                <span style={{ minWidth: 24, textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--black-100)' }}>
                  {c.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeCantidad(c.productId, c.cantidad + 1)}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-60)' }}
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRemove(c.productId)}
                aria-label="Quitar componente"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black-40)', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {error && <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: 0 }}>{error}</p>}

      {/* Línea de referencia — informativo, no afecta el precio guardado */}
      {componentes.length > 0 && (
        <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16, fontSize: 12, color: 'var(--black-60)' }}>
          Suma individual: ${sumaIndividual.toLocaleString('es-CO')}
          {ahorro > 0 && <> — Ahorra ${ahorro.toLocaleString('es-CO')} vs. comprar por separado</>}
        </div>
      )}
    </div>
  );
}
