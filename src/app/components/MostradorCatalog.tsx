import React, { useState, useMemo } from 'react';
import { Search, Star } from 'lucide-react';
import { CAT_DEFS, CAT_PRODUCTS, ALL_CATALOG_PRODUCTS } from '../data/productCatalog';
import type { CatalogProduct } from '../data/productCatalog';
import { useFavorites } from '../store/favoritesStore';

// ─── Tipo compartido con HomePage ─────────────────────────────────────────────

export interface MostradorProduct {
  id:           number;
  name:         string;
  price:        number;
  description?: string;
  category:     string;
  image:        string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function toMostradorProduct(p: CatalogProduct): MostradorProduct {
  const def = CAT_DEFS.find(c => c.id === p.catId)!;
  return {
    id:          p.id,
    name:        p.name,
    price:       p.price,
    description: p.description,
    category:    def.name,
    image:       p.image ?? '',
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function MostradorCatalog({
  onAddProduct,
  activeOrderItems,
}: {
  onAddProduct:     (product: MostradorProduct) => void;
  activeOrderItems: { productId: number; quantity: number }[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat]     = useState<string>('favoritos');
  const { favoriteIds, toggleFavorite } = useFavorites();

  const isSearching = searchQuery.trim().length > 0;

  const displayedProducts = useMemo(() => {
    let base: CatalogProduct[];
    if (isSearching) {
      base = ALL_CATALOG_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return base;
    }
    if (activeCat === 'favoritos') {
      base = ALL_CATALOG_PRODUCTS.filter(p => favoriteIds.has(p.id));
    } else {
      base = CAT_PRODUCTS[activeCat] ?? [];
    }
    return [
      ...base.filter(p => favoriteIds.has(p.id)),
      ...base.filter(p => !favoriteIds.has(p.id)),
    ];
  }, [activeCat, searchQuery, isSearching, favoriteIds]);

  const inOrderQty = (id: number) =>
    activeOrderItems
      .filter(i => i.productId === id)
      .reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--blue-10)]">

      {/* ── Buscador ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', height: 56, padding: '0 24px', gap: 16, background: 'white', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#909090" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o código de producto..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', border: '1.5px solid #E0E0E0', borderRadius: 8,
              padding: '8px 12px 8px 36px', fontSize: 14,
              fontFamily: 'Montserrat, sans-serif', color: '#1E1E1E',
              backgroundColor: 'white', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#121E6C')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Chips horizontales de categorías ─────────────────────────────── */}
        <div
          className="no-scrollbar shrink-0"
          style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '12px 16px', borderBottom: '1px solid #F0F0F0', background: '#F1F2F6' }}
        >
          {/* Favoritos */}
          {(() => {
            const isFavActive = activeCat === 'favoritos' && !isSearching;
            return (
              <button
                onClick={() => { setActiveCat('favoritos'); setSearchQuery(''); }}
                style={{
                  height: 40, padding: '12px 16px', borderRadius: 100,
                  border: 'none', flexShrink: 0,
                  background: isFavActive ? '#121E6C' : 'white',
                  display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap', cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif', transition: 'all 150ms ease',
                  boxShadow: isFavActive ? '0px 4px 12px 0px rgba(18,30,108,0.08)' : 'none',
                }}
              >
                <Star
                  size={14}
                  strokeWidth={1.5}
                  style={{ flexShrink: 0, color: isFavActive ? 'white' : '#121E6C', fill: isFavActive ? 'white' : 'none' }}
                />
                <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', color: isFavActive ? 'white' : '#1E1E1E' }}>
                  Favoritos
                </span>
              </button>
            );
          })()}

          {/* Categorías del catálogo */}
          {CAT_DEFS.map(cat => {
            const isActive = cat.id === activeCat && !isSearching;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCat(cat.id); setSearchQuery(''); }}
                style={{
                  height: 40, padding: '12px 16px', borderRadius: 100,
                  border: 'none', flexShrink: 0,
                  background: isActive ? cat.color : 'white',
                  display: 'flex', alignItems: 'center', gap: 8,
                  whiteSpace: 'nowrap', cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif', transition: 'all 150ms ease',
                  boxShadow: isActive ? '0px 4px 12px 0px rgba(18,30,108,0.08)' : 'none',
                }}
              >
                {!isActive && (
                  <div style={{ width: 4, height: 16, borderRadius: 16, flexShrink: 0, backgroundColor: cat.color }} />
                )}
                <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '16px', color: isActive ? 'white' : '#1E1E1E' }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Grid de productos ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3">

          {isSearching && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <span className="text-sm font-semibold text-[var(--black-100)]">
                {displayedProducts.length} resultado{displayedProducts.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-[var(--black-40)]">para «{searchQuery}»</span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-auto text-xs font-semibold text-[var(--blue-100)] hover:underline"
              >
                Limpiar
              </button>
            </div>
          )}

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayedProducts.map(item => {
                const def   = CAT_DEFS.find(c => c.id === item.catId) ?? CAT_DEFS[0];
                const qty   = inOrderQty(item.id);
                const isFav = favoriteIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onAddProduct(toMostradorProduct(item))}
                    className="text-left transition-all active:scale-[0.97] hover:brightness-95 cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      display: 'flex', flexDirection: 'row', alignItems: 'center',
                      padding: 12, gap: 12, borderRadius: 12,
                    }}
                  >
                    {/* Barra izquierda 4px — color de categoría */}
                    <div style={{ alignSelf: 'stretch', width: 4, flexShrink: 0, borderRadius: 2, backgroundColor: def.color }} />

                    {/* Nombre + precio */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 14,
                        lineHeight: '20px', color: '#1e1e1e',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: 14,
                        lineHeight: '20px', color: '#1e1e1e', whiteSpace: 'nowrap',
                      }}>
                        ${item.price.toLocaleString('es-CO')}
                      </span>
                    </div>

                    {/* Columna derecha: badge cantidad (arriba) + estrella (abajo) */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: qty > 0 ? 'space-between' : 'flex-end',
                      alignSelf: 'stretch', width: 24, flexShrink: 0,
                    }}>
                      {qty > 0 && (
                        <div style={{
                          width: 24, height: 24, borderRadius: 100,
                          backgroundColor: '#121E6C',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, lineHeight: '16px' }}>
                            {qty}
                          </span>
                        </div>
                      )}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={e => toggleFavorite(item.id, e)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleFavorite(item.id, e as unknown as React.MouseEvent); }}
                        style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Star
                          size={14}
                          strokeWidth={1.5}
                          style={{
                            color: isFav ? 'var(--black-60)' : 'var(--black-40)',
                            fill:  isFav ? 'var(--black-60)' : 'none',
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--black-40)] gap-3">
              <Search size={40} className="opacity-20" />
              <p className="font-medium text-sm">
                {isSearching
                  ? `Sin resultados para «${searchQuery}»`
                  : activeCat === 'favoritos'
                  ? 'Aún no hay productos favoritos'
                  : 'Sin productos en esta categoría'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
