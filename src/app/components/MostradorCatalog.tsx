import { useState, useMemo } from 'react';
import { Search, Plus, LayoutGrid, Star } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CAT_DEFS, CAT_PRODUCTS, ALL_CATALOG_PRODUCTS, FAVORITE_PRODUCTS } from '../data/productCatalog';
import type { CatDef, CatalogProduct } from '../data/productCatalog';
import { useFavorites } from '../store/favoritesStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Tipo compartido con App.tsx ──────────────────────────────────────────────

export interface MostradorProduct {
  id:           number;
  name:         string;
  price:        number;
  description?: string;
  category:     string;
  image:        string;
}

// ─── Icono Grid 3×3 (toggle Vista Grid) ──────────────────────────────────────

function Grid3Icon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1"  y="1"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6"  y="1"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="11" y="1"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="1"  y="6"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6"  y="6"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="11" y="6"  width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="1"  y="11" width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="6"  y="11" width="4" height="4" rx="0.8" fill="currentColor" />
      <rect x="11" y="11" width="4" height="4" rx="0.8" fill="currentColor" />
    </svg>
  );
}

// ─── Placeholder gris cuando el producto no tiene imagen ─────────────────────

function ImagePlaceholder({ catColor }: { catColor: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: `${catColor}15` }}
    >
      <div
        className="w-10 h-10 rounded-full opacity-30"
        style={{ backgroundColor: catColor }}
      />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMostradorProduct(p: CatalogProduct, def: CatDef): MostradorProduct {
  return {
    id:          p.id,
    name:        p.name,
    price:       p.price,
    description: p.description,
    category:    def.name,
    image:       p.image ?? '',
  };
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function MostradorCatalog({
  onAddProduct,
  activeOrderItems,
}: {
  onAddProduct: (product: MostradorProduct) => void;
  activeOrderItems: { productId: number; quantity: number }[];
}) {
  const [view, setView]           = useState<'categories' | 'grid'>('categories');
  const [activeCat, setActiveCat] = useState<string>('favoritos');
  const [search, setSearch]       = useState('');
  const [gridCat, setGridCat]     = useState('Favoritos');

  const { favoriteIds, toggleFavorite } = useFavorites();

  const isSearching   = search.trim().length > 0;
  const activeCatDef  = CAT_DEFS.find(c => c.id === activeCat) ?? CAT_DEFS[0];
  const inOrderQty    = (id: number) =>
    activeOrderItems.find(i => i.productId === id)?.quantity ?? 0;

  // ── Productos Vista Categorías ─────────────────────────────────────────────
  const catProducts = useMemo(
    () => {
      let base: CatalogProduct[];
      if (activeCat === 'favoritos') {
        base = ALL_CATALOG_PRODUCTS.filter(p => favoriteIds.has(p.id));
      } else {
        base = CAT_PRODUCTS[activeCat] ?? [];
      }
      // Favoritos primero, luego el resto en orden original
      const sorted = [
        ...base.filter(p => favoriteIds.has(p.id)),
        ...base.filter(p => !favoriteIds.has(p.id)),
      ];
      return sorted.filter(p =>
        !isSearching || p.name.toLowerCase().includes(search.toLowerCase()),
      );
    },
    [activeCat, search, isSearching, favoriteIds],
  );

  // búsqueda cruzada (cuando hay query, buscar en todo el catálogo)
  const crossSearch = useMemo(
    () => isSearching
      ? ALL_CATALOG_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : [],
    [search, isSearching],
  );

  const displayedCatProducts = isSearching ? crossSearch : catProducts;

  // ── Productos Vista Grid ────────────────────────────────────────────────────
  const gridProducts = useMemo(
    () => {
      const base = gridCat === 'Favoritos'
        ? ALL_CATALOG_PRODUCTS.filter(p => favoriteIds.has(p.id))
        : ALL_CATALOG_PRODUCTS.filter(p => p.catId === gridCat);
      const sorted = [
        ...base.filter(p => favoriteIds.has(p.id)),
        ...base.filter(p => !favoriteIds.has(p.id)),
      ];
      return sorted.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    },
    [gridCat, search, favoriteIds],
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--blue-10)]">

      {/* ── Barra superior: buscador + toggle ── */}
      <div className="flex items-center h-14 px-5 gap-4 bg-white shrink-0" style={{ borderBottom: '1.5px solid var(--black-10)' }}>
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--black-40)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o código de producto..."
            className="pos-input pl-10"
            style={{ fontSize: 14, padding: '10px 14px 10px 36px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {([
            ['categories', <LayoutGrid size={16} />, 'Vista Categorías'],
            ['grid',       <Grid3Icon size={16} />,  'Vista Grid (con fotos)'],
          ] as ['categories' | 'grid', React.ReactNode, string][]).map(([v, icon, title]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={title}
              style={{
                width: 32, height: 32,
                borderRadius: 'var(--radius-8)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background:  view === v ? 'var(--blue-10)' : 'transparent',
                color: view === v ? 'var(--blue-100)' : 'var(--black-40)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >{icon}</button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA CATEGORÍAS — dos columnas: barra lateral + grid de color blocks
          ══════════════════════════════════════════════════════════════════ */}
      {view === 'categories' && (
        <div className="flex-1 flex overflow-hidden">

          {/* ── Columna izquierda: categorías ── */}
          <div className="cat-sidebar shrink-0" style={{ width: 220 }}>

            {/* Favoritos */}
            {(() => {
              const isFavActive = activeCat === 'favoritos' && !isSearching;
              return (
                <button
                  onClick={() => { setActiveCat('favoritos'); setSearch(''); }}
                  className="cat-item w-full text-left flex items-center justify-between gap-2"
                  style={{
                    borderLeftColor: 'var(--black-100)',
                    background: isFavActive ? 'var(--black-10)' : '#fff',
                    color: 'var(--black-100)',
                    fontWeight: isFavActive ? 700 : 500,
                    padding: '12px 20px',
                  }}
                >
                  <div>
                    <span style={{ display: 'block', fontSize: 14 }}>Favoritos</span>
                    <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                      {favoriteIds.size} producto{favoriteIds.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Star size={12} style={{ flexShrink: 0 }} strokeWidth={1.5} />
                </button>
              );
            })()}

            {CAT_DEFS.map(cat => {
              const isActive = cat.id === activeCat && !isSearching;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setSearch(''); }}
                  className="cat-item w-full text-left"
                  style={{
                    borderLeftColor: cat.lineColor,
                    background: isActive ? cat.lightBg : '#fff',
                    color: cat.darkColor,
                    fontWeight: isActive ? 700 : 500,
                    padding: '12px 20px',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 14 }}>{cat.name}</span>
                  <span style={{ display: 'block', fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                    {CAT_PRODUCTS[cat.id]?.length ?? 0} productos
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Columna derecha: bloques de color con nombre + precio ── */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3">

            {/* Encabezado — solo en modo búsqueda cruzada */}
            {isSearching && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <span className="text-sm font-semibold text-[var(--black-100)]">
                  {crossSearch.length} resultado{crossSearch.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[var(--black-40)]">para «{search}»</span>
                <button
                  onClick={() => setSearch('')}
                  className="ml-auto text-xs font-semibold text-[var(--blue-100)] hover:underline"
                >
                  Limpiar
                </button>
              </div>
            )}

            {/* Grid de bloques LightSpeed — sin imágenes, texto grande */}
            {displayedCatProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayedCatProducts.map(item => {
                  const def = CAT_DEFS.find(c => c.id === item.catId) ?? CAT_DEFS[0];
                  const qty = inOrderQty(item.id);
                  const isFav = favoriteIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => onAddProduct(toMostradorProduct(item, def))}
                      className="relative text-left flex flex-col justify-between p-4 min-h-[110px] rounded-[var(--radius-12)] transition-all active:scale-[0.97] hover:brightness-95 cursor-pointer"
                      style={{ backgroundColor: def.lightBg }}
                    >
                      {/* Badge cantidad en orden — esquina inferior derecha (color de categoría) */}
                      {qty > 0 && (
                        <div
                          className="absolute bottom-2 right-2 min-w-[22px] h-5 px-1.5 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: def.color }}
                        >
                          {qty}
                        </div>
                      )}

                      {/* Estrella favorito — siempre visible, independiente del globo */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => toggleFavorite(item.id, e)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFavorite(item.id, e as unknown as React.MouseEvent); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 cursor-pointer"
                        style={
                          isFav
                            ? { backgroundColor: '#FFFFFF', opacity: 1, boxShadow: '0px 1px 3px rgba(0,0,0,0.12)' }
                            : { backgroundColor: '#FFFFFF', opacity: 0.6 }
                        }
                        title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Star
                          size={13}
                          strokeWidth={1.5}
                          style={{
                            display: 'block',
                            color: isFav ? 'var(--black-60)' : 'var(--black-40)',
                            fill: isFav ? 'var(--black-60)' : 'none',
                          }}
                        />
                      </div>

                      {/* Nombre */}
                      <span
                        className="leading-snug pr-8"
                        style={{ color: 'var(--black-100)', fontSize: '16px', fontWeight: 600, lineHeight: '24px' }}
                      >
                        {item.name}
                      </span>

                      {/* Precio — Black/100 */}
                      <span
                        className="mt-3 block"
                        style={{ color: 'var(--black-100)', fontSize: '14px', fontWeight: 600, lineHeight: '18px' }}
                      >
                        ${item.price.toLocaleString('es-CO')}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--black-40)] gap-3">
                <Search size={40} className="opacity-20" />
                <p className="font-medium text-sm">
                  {isSearching
                    ? `Sin resultados para «${search}»`
                    : activeCat === 'favoritos'
                    ? 'Aún no hay productos favoritos'
                    : 'Sin productos en esta categoría'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA GRID — 56 productos con fotos (51 con imagen, 5 placeholder)
          ══════════════════════════════════════════════════════════════════ */}
      {view === 'grid' && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {gridProducts.map(p => {
                const def = CAT_DEFS.find(c => c.id === p.catId) ?? CAT_DEFS[0];
                const qty = inOrderQty(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => onAddProduct(toMostradorProduct(p, def))}
                    className="hover:shadow-md transition-all relative cursor-pointer hover:border-[var(--blue-100)] active:scale-[0.97]"
                    style={{ height: '160px', display: 'flex', flexDirection: 'column', borderRadius: '10px', overflow: 'hidden' }}
                  >
                    <div className="relative h-[76px] rounded-[var(--radius-12)] overflow-hidden bg-[var(--blue-10)]">
                      {p.image ? (
                        <ImageWithFallback
                          src={p.image}
                          alt={p.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImagePlaceholder catColor={def.color} />
                      )}

                      {/* Estrella — toggle favorito (touch target independiente) */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className="absolute top-1.5 right-1.5 rounded-full p-1 bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all hover:scale-110 active:scale-95"
                        title={favoriteIds.has(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Star
                          size={11}
                          className={favoriteIds.has(p.id) ? 'fill-[var(--feedback-warning-100)] text-[var(--feedback-warning-100)]' : 'fill-transparent text-white'}
                          strokeWidth={favoriteIds.has(p.id) ? 1.5 : 2}
                        />
                      </button>

                      {/* Indicador visual "+" */}
                      <div className="absolute bottom-1.5 right-1.5 bg-white rounded-full p-1 shadow-sm border border-[var(--black-10)] text-[var(--blue-100)]">
                        <Plus size={12} />
                      </div>

                      {/* Badge cantidad en orden — color de categoría */}
                      {qty > 0 && (
                        <div className="absolute top-1.5 left-1.5 min-w-[18px] h-4 px-1 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: def.color }}>
                          {qty}
                        </div>
                      )}
                    </div>
                    <div style={{
                      flexShrink: 0,
                      padding: '8px 10px 10px 14px',
                      backgroundColor: 'white',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E1E1E', lineHeight: '1.2', fontFamily: 'Montserrat, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.name}
                      </h3>
                      <p style={{ color: 'var(--blue-100)', fontSize: '11px', fontWeight: 600, lineHeight: '16px' }}>
                        ${p.price.toLocaleString()}
                      </p>
                    </div>
                    {/* Barra vertical izquierda de categoría (4px, full height) */}
                    <div
                      className="absolute top-0 left-0 bottom-0 w-[4px]"
                      style={{ backgroundColor: def.color }}
                    />
                  </div>
                );
              })}
            </div>

            {gridProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-[var(--black-40)] gap-4">
                <Search size={48} className="opacity-20" />
                <p className="font-medium">No encontramos productos con «{search}»</p>
              </div>
            )}
          </div>

          {/* Filtro de categorías (Vista Grid) */}
          <div className="shrink-0 flex items-center gap-2 overflow-x-auto" style={{ padding: '8px 0', borderTop: '1px solid var(--black-10)' }}>
            <button
              onClick={() => setGridCat('Favoritos')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-20)',
                fontSize: 12, fontWeight: 700,
                whiteSpace: 'nowrap',
                border: '1.5px solid',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                display: 'flex', alignItems: 'center', gap: 6,
                ...(gridCat === 'Favoritos'
                  ? { background: '#121e6c', color: '#fff', borderColor: '#121e6c' }
                  : { background: 'transparent', color: '#121e6c', borderColor: '#121e6c' })
              }}
            >
              <Star size={11} style={{ fill: gridCat === 'Favoritos' ? '#fff' : '#121e6c', color: gridCat === 'Favoritos' ? '#fff' : '#121e6c' }} />
              Favoritos
            </button>
            {CAT_DEFS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setGridCat(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-20)',
                  fontSize: 12, fontWeight: gridCat === cat.id ? 700 : 500,
                  whiteSpace: 'nowrap',
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  ...(gridCat === cat.id
                    ? { background: cat.color, color: '#fff', borderColor: cat.color }
                    : { background: 'transparent', color: cat.color, borderColor: cat.color })
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}