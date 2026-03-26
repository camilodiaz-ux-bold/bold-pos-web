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
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/30">

      {/* ── Barra superior: buscador + toggle ── */}
      <div className="flex items-center h-14 px-6 gap-4 bg-white border-b border-gray-100 shrink-0">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o código de producto..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setView('categories')}
            title="Vista Categorías"
            className={cn(
              'p-1.5 rounded-md transition-all',
              view === 'categories' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('grid')}
            title="Vista Grid (con fotos)"
            className={cn(
              'p-1.5 rounded-md transition-all',
              view === 'grid' ? 'bg-white shadow-sm text-blue-900' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <Grid3Icon size={16} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA CATEGORÍAS — dos columnas: barra lateral + grid de color blocks
          ══════════════════════════════════════════════════════════════════ */}
      {view === 'categories' && (
        <div className="flex-1 flex overflow-hidden">

          {/* ── Columna izquierda: categorías (color LightSpeed) ── */}
          <div className="w-[200px] shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-y-auto no-scrollbar py-3 gap-1.5 px-2">

            {/* ── Favoritos — categoría especial (primera posición) ── */}
            {(() => {
              const isFavActive = activeCat === 'favoritos' && !isSearching;
              return (
                <button
                  onClick={() => { setActiveCat('favoritos'); setSearch(''); }}
                  className={cn(
                    'w-full text-left rounded-xl transition-all overflow-hidden',
                    isFavActive ? 'shadow-md' : 'hover:brightness-95',
                  )}
                  style={{
                    backgroundColor: isFavActive ? '#1E1E1E' : '#F3F3F3',
                    boxShadow: isFavActive ? '0 2px 10px rgba(30,30,30,0.35)' : undefined,
                  }}
                >
                  <div className="px-3 py-3.5 flex items-start gap-1.5">
                    <div className="flex-1 min-w-0">
                      <span
                        className="block"
                        style={{ color: isFavActive ? '#fff' : '#1E1E1E', fontSize: '15px', fontWeight: 600, lineHeight: '20px' }}
                      >
                        Favoritos
                      </span>
                      <span
                        className="block mt-1"
                        style={{ color: isFavActive ? 'rgba(255,255,255,0.65)' : '#606060', fontSize: '12px', fontWeight: 400, lineHeight: '16px' }}
                      >
                        {favoriteIds.size} producto{favoriteIds.size !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Star
                      size={12}
                      style={{
                        display: 'block',
                        marginTop: '2px',
                        color: isFavActive ? '#fff' : '#606060',
                        fill: isFavActive ? '#fff' : '#606060',
                        flexShrink: 0,
                      }}
                      strokeWidth={1.5}
                    />
                  </div>
                </button>
              );
            })()}

            {CAT_DEFS.map(cat => {
              const isActive = cat.id === activeCat && !isSearching;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setSearch(''); }}
                  className={cn(
                    'w-full text-left rounded-xl transition-all overflow-hidden',
                    isActive ? 'shadow-md' : 'hover:brightness-95',
                  )}
                  style={{
                    backgroundColor: isActive ? cat.color : cat.merlinBg,
                    boxShadow: isActive ? `0 2px 10px ${cat.color}60` : undefined,
                  }}
                >
                  <div className="px-3 py-3.5">
                    <span
                      className="block"
                      style={{
                        color: isActive ? '#fff' : cat.merlinNameColor,
                        fontSize: '15px', fontWeight: 600, lineHeight: '20px',
                      }}
                    >
                      {cat.name}
                    </span>
                    <span
                      className="block mt-1"
                      style={{
                        color: isActive ? 'rgba(255,255,255,0.75)' : cat.merlinCountColor,
                        opacity: isActive ? 1 : 0.8,
                        fontSize: '12px', fontWeight: 400, lineHeight: '16px',
                      }}
                    >
                      {CAT_PRODUCTS[cat.id]?.length ?? 0} productos
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Columna derecha: bloques de color con nombre + precio ── */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3">

            {/* Encabezado — solo en modo búsqueda cruzada */}
            {isSearching && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <span className="text-sm font-black text-gray-700">
                  {crossSearch.length} resultado{crossSearch.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-400">para «{search}»</span>
                <button
                  onClick={() => setSearch('')}
                  className="ml-auto text-xs font-bold text-blue-600 hover:underline"
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
                      className="relative text-left flex flex-col justify-between p-4 min-h-[110px] rounded-xl transition-all active:scale-[0.97] hover:brightness-95 cursor-pointer"
                      style={{ backgroundColor: def.lightBg }}
                    >
                      {/* Badge cantidad en orden — esquina inferior derecha */}
                      {qty > 0 && (
                        <div
                          className="absolute bottom-2 right-2 min-w-[22px] h-5 px-1.5 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: '#FF2947' }}
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
                            color: isFav ? '#606060' : '#969696',
                            fill: isFav ? '#606060' : 'none',
                          }}
                        />
                      </div>

                      {/* Nombre */}
                      <span
                        className="leading-snug pr-8"
                        style={{ color: '#1E1E1E', fontSize: '16px', fontWeight: 600, lineHeight: '24px' }}
                      >
                        {item.name}
                      </span>

                      {/* Precio — Black/100 */}
                      <span
                        className="mt-3 block"
                        style={{ color: '#1E1E1E', fontSize: '14px', fontWeight: 600, lineHeight: '18px' }}
                      >
                        ${item.price.toLocaleString('es-CO')}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
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
                    className="bg-white rounded-xl border border-gray-100 p-2 flex flex-col gap-1.5 hover:shadow-md transition-all relative cursor-pointer hover:border-blue-200 active:scale-[0.97] overflow-hidden"
                  >
                    <div className="relative h-[76px] rounded-lg overflow-hidden bg-gray-50">
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
                          className={favoriteIds.has(p.id) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-white'}
                          strokeWidth={favoriteIds.has(p.id) ? 1.5 : 2}
                        />
                      </button>

                      {/* Indicador visual "+" */}
                      <div className="absolute bottom-1.5 right-1.5 bg-white rounded-full p-1 shadow-sm border border-gray-100 text-blue-600">
                        <Plus size={12} />
                      </div>

                      {/* Badge cantidad en orden */}
                      {qty > 0 && (
                        <div className="absolute top-1.5 left-1.5 min-w-[18px] h-4 px-1 bg-blue-700 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                          {qty}
                        </div>
                      )}
                    </div>
                    <div>
                      <p style={{ color: '#1F2A74', fontSize: '11px', fontWeight: 600, lineHeight: '16px' }}>
                        ${p.price.toLocaleString()}
                      </p>
                      <h3 style={{ color: '#1E1E1E', fontSize: '14px', fontWeight: 600, lineHeight: '20px' }} className="line-clamp-2">
                        {p.name}
                      </h3>
                    </div>
                    {/* Línea inferior de categoría — color Merlin */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[3px]"
                      style={{ backgroundColor: def.lineColor }}
                    />
                  </div>
                );
              })}
            </div>

            {gridProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <Search size={48} className="opacity-20" />
                <p className="font-medium">No encontramos productos con «{search}»</p>
              </div>
            )}
          </div>

          {/* Filtro de categorías (Vista Grid) */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm shrink-0">
            <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                key="Favoritos"
                onClick={() => setGridCat('Favoritos')}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5',
                  gridCat === 'Favoritos'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-600',
                )}
              >
                <Star size={11} className={gridCat === 'Favoritos' ? 'fill-white' : 'fill-amber-400'} />
                Favoritos
              </button>
              {CAT_DEFS.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setGridCat(cat.id)}
                  className={cn(
                    'px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
                    gridCat === cat.id ? 'text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
                  )}
                  style={gridCat === cat.id ? { backgroundColor: cat.color } : undefined}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}