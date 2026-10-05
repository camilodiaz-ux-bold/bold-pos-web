/**
 * retail/productCatalog.ts — Catálogo POS de la vertical Retail (tienda de ropa y accesorios).
 * Misma forma que data/productCatalog.ts (Restaurantes). Los ids 201+ no colisionan con
 * los de Restaurantes (101-184): comboBridge busca componentes en ambos catálogos.
 * Sin imágenes: Mostrador usa el placeholder gris. La paleta de categorías reutiliza
 * la de CAT_DEFS (Restaurantes) para no introducir colores nuevos.
 */
import { CAT_DEFS } from '../productCatalog';
import type { CatDef, CatalogProduct } from '../productCatalog';

const palette = (index: number) => CAT_DEFS[index];

export const RETAIL_CAT_DEFS: CatDef[] = [
  { ...palette(0), id: 'camisetas', name: 'Camisetas & Tops' },
  { ...palette(2), id: 'pantalones', name: 'Pantalones & Jeans' },
  { ...palette(4), id: 'chaquetas', name: 'Chaquetas & Abrigos' },
  { ...palette(6), id: 'calzado', name: 'Calzado' },
  { ...palette(3), id: 'accesorios', name: 'Accesorios' },
  { ...palette(1), id: 'cuidado', name: 'Cuidado Personal' },
  // Combos es un módulo core: existe también en Retail (ver specs/2026-10-selector-vertical.md).
  { ...palette(9), id: 'combos', name: 'Combos' },
];

export const RETAIL_CAT_PRODUCTS: Record<string, CatalogProduct[]> = {
  'camisetas': [
    { id: 211, name: 'Camiseta Básica Algodón', price: 45900, description: 'Cuello redondo, 100% algodón peinado', catId: 'camisetas' },
    { id: 212, name: 'Camiseta Oversize Estampada', price: 69900, description: 'Corte holgado con estampado frontal', catId: 'camisetas' },
    { id: 213, name: 'Polo Piqué Clásico', price: 79900, description: 'Cuello polo con botones y logo bordado', catId: 'camisetas' },
    { id: 214, name: 'Camiseta Deportiva Dry-Fit', price: 59900, description: 'Tela transpirable de secado rápido', catId: 'camisetas' },
    { id: 215, name: 'Camisa Lino Manga Larga', price: 129900, description: 'Lino lavado, corte regular', catId: 'camisetas' },
    { id: 216, name: 'Top Básico Tirantes', price: 39900, description: 'Algodón elástico, ajuste ceñido', catId: 'camisetas' },
  ],
  'pantalones': [
    { id: 221, name: 'Jean Slim Azul Oscuro', price: 159900, description: 'Denim elástico, tiro medio', catId: 'pantalones' },
    { id: 222, name: 'Jean Recto Clásico', price: 149900, description: 'Denim rígido, corte recto', catId: 'pantalones' },
    { id: 223, name: 'Jogger Algodón', price: 99900, description: 'Puños elásticos y bolsillos laterales', catId: 'pantalones' },
    { id: 224, name: 'Pantalón Chino Beige', price: 139900, description: 'Gabardina stretch, corte slim', catId: 'pantalones' },
    { id: 225, name: 'Short Cargo', price: 89900, description: 'Seis bolsillos, algodón twill', catId: 'pantalones' },
    { id: 226, name: 'Falda Midi Plisada', price: 119900, description: 'Cintura elástica, tela fluida', catId: 'pantalones' },
  ],
  'chaquetas': [
    { id: 231, name: 'Chaqueta Jean Clásica', price: 199900, description: 'Denim lavado con botones metálicos', catId: 'chaquetas' },
    { id: 232, name: 'Cortavientos Ligero', price: 169900, description: 'Repelente al agua, capucha ajustable', catId: 'chaquetas' },
    { id: 233, name: 'Hoodie Canguro', price: 129900, description: 'Felpa interna, bolsillo frontal', catId: 'chaquetas' },
    { id: 234, name: 'Chaleco Acolchado', price: 179900, description: 'Relleno sintético, cuello alto', catId: 'chaquetas' },
    { id: 235, name: 'Blazer Casual', price: 249900, description: 'Corte recto, forro interno', catId: 'chaquetas' },
  ],
  'calzado': [
    { id: 241, name: 'Tenis Urbanos Blancos', price: 229900, description: 'Suela vulcanizada, capellada sintética', catId: 'calzado' },
    { id: 242, name: 'Tenis Running Pro', price: 329900, description: 'Amortiguación reforzada, malla transpirable', catId: 'calzado' },
    { id: 243, name: 'Botín Cuero Café', price: 289900, description: 'Cuero genuino, suela antideslizante', catId: 'calzado' },
    { id: 244, name: 'Sandalia Confort', price: 109900, description: 'Plantilla anatómica ajustable', catId: 'calzado' },
    { id: 245, name: 'Zapato Casual Mocasín', price: 199900, description: 'Cuero sintético, suela flexible', catId: 'calzado' },
  ],
  'accesorios': [
    { id: 251, name: 'Gorra Visera Curva', price: 49900, description: 'Ajuste trasero, bordado frontal', catId: 'accesorios' },
    { id: 252, name: 'Cinturón Cuero Negro', price: 69900, description: 'Hebilla metálica clásica', catId: 'accesorios' },
    { id: 253, name: 'Bufanda Tejida', price: 59900, description: 'Mezcla de lana, 180 cm', catId: 'accesorios' },
    { id: 254, name: 'Mochila Urbana 20L', price: 139900, description: 'Compartimiento para portátil', catId: 'accesorios' },
    { id: 255, name: 'Gafas de Sol Polarizadas', price: 119900, description: 'Protección UV400', catId: 'accesorios' },
    { id: 256, name: 'Medias Pack x3', price: 29900, description: 'Algodón, tobillera', catId: 'accesorios' },
    { id: 257, name: 'Billetera Cuero', price: 89900, description: 'Seis tarjeteros y monedero', catId: 'accesorios' },
  ],
  'cuidado': [
    { id: 261, name: 'Perfume Cítrico 50 ml', price: 179900, description: 'Fragancia fresca unisex', catId: 'cuidado' },
    { id: 262, name: 'Crema Hidratante 200 ml', price: 39900, description: 'Con aloe vera, uso diario', catId: 'cuidado' },
    { id: 263, name: 'Protector Solar FPS 50', price: 49900, description: 'Resistente al agua, 120 ml', catId: 'cuidado' },
    { id: 264, name: 'Bálsamo Labial', price: 12900, description: 'Con manteca de karité', catId: 'cuidado' },
  ],
};

export const RETAIL_ALL_PRODUCTS: CatalogProduct[] = Object.values(RETAIL_CAT_PRODUCTS).flat();

/** Favoritos iniciales: el primer producto de cada categoría. */
export const RETAIL_FAVORITE_IDS: Set<number> = new Set([211, 221, 231, 241, 251, 261]);
