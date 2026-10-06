/**
 * retail/productVariants.ts — Variantes mock de productos Retail (specs/2026-10-combos-variantes-retail.md).
 * Un producto tiene hasta 2 tipos de variante (Talla × Color); cada combinación es un SKU
 * con precio, código, costo y existencia propios. Viven fuera de CatalogProduct para no
 * tocar el tipo compartido con Restaurantes. Determinista (sin Math.random).
 */

export interface VariantType {
  nombre: string;
  opciones: string[];
}

export interface ProductVariant {
  id: string;
  /** Una opción por tipo, en el orden de `tipos` — ej. ['Azul', 'S']. */
  opciones: string[];
  /** "Azul / S" */
  label: string;
  price: number;
  codigo: string;
  costo: number;
  existencia: number;
}

export interface ProductVariants {
  tipos: VariantType[];
  variantes: ProductVariant[];
}

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

/** Producto cartesiano de los tipos → variantes. `priceDelta` permite variar el precio por combinación. */
function build(
  productId: number,
  basePrice: number,
  tipos: VariantType[],
  priceDelta: (opciones: string[]) => number = () => 0,
): ProductVariants {
  let combos: string[][] = [[]];
  for (const t of tipos) combos = combos.flatMap(c => t.opciones.map(o => [...c, o]));
  const variantes = combos.map((opciones, i): ProductVariant => {
    const price = basePrice + priceDelta(opciones);
    return {
      id: `${productId}-${opciones.map(slug).join('-')}`,
      opciones,
      label: opciones.join(' / '),
      price,
      codigo: `I-${17912399000 + productId * 10 + i}`,
      costo: Math.round(price * 0.45),
      existencia: ((productId + i * 7) % 5) * 15 + 15,
    };
  });
  return { tipos, variantes };
}

export const RETAIL_PRODUCT_VARIANTS: Record<number, ProductVariants> = {
  // Camiseta Básica Algodón — igual al ejemplo del POS real (Color × Talla)
  211: build(211, 45900, [
    { nombre: 'Color', opciones: ['Azul', 'Negro'] },
    { nombre: 'Talla', opciones: ['S', 'M'] },
  ], o => (o[1] === 'M' ? 2000 : 0)),
  // Jean Slim Azul Oscuro
  221: build(221, 159900, [{ nombre: 'Talla', opciones: ['30', '32', '34'] }], o => (o[0] === '34' ? 5000 : 0)),
  // Hoodie Canguro
  233: build(233, 129900, [
    { nombre: 'Color', opciones: ['Gris', 'Negro'] },
    { nombre: 'Talla', opciones: ['M', 'L'] },
  ]),
  // Tenis Urbanos Blancos
  241: build(241, 229900, [
    { nombre: 'Talla', opciones: ['38', '40', '42'] },
    { nombre: 'Color', opciones: ['Blanco', 'Crema'] },
  ], o => (o[1] === 'Crema' ? 10000 : 0)),
  // Gorra Visera Curva — un solo tipo
  251: build(251, 49900, [{ nombre: 'Color', opciones: ['Negro', 'Azul', 'Beige'] }]),
};

export function getProductVariants(productId: number): ProductVariants | undefined {
  return RETAIL_PRODUCT_VARIANTS[productId];
}

export function findProductVariant(productId: number, variantId: string): ProductVariant | undefined {
  return RETAIL_PRODUCT_VARIANTS[productId]?.variantes.find(v => v.id === variantId);
}
