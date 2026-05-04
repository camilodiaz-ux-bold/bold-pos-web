/**
 * productCatalog.ts — Fuente de verdad única del catálogo.
 * Usada por MostradorCatalog (Vista Categorías + Vista Grid) y MesaProductSelector.
 * 51 productos con imagen · 5 sin imagen (Gazpacho de Cerezas, Sopa de Cebolla Moderna,
 * Agua de Piedra, Infusión de Rooibos, Sorbetes Artesanales).
 */

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CatDef {
  id:              string;
  name:            string;
  color:           string;   // color sólido del identificador (mid-tone) — activo sidebar / pills grid
  lightBg:         string;   // fondo claro (tarjeta Vista Categorías — bloques de producto)
  darkText:        string;   // texto oscuro sobre fondo claro (badge cantidad en orden)
  darkColor:       string;   // color saturado oscuro (badge cantidad en orden)
  // ── Paleta Merlin oficial ──────────────────────────────────────────────────
  merlinBg:        string;   // fondo Merlin /10-/30 para sidebar de categorías (inactivo)
  merlinNameColor: string;   // texto nombre en sidebar (Merlin /150-/200)
  merlinCountColor:string;   // texto conteo productos en sidebar (Merlin /100-/150)
  lineColor:       string;   // franja inferior en cards con imagen (Vista Grid)
}

export interface CatalogProduct {
  id:          number;
  name:        string;
  price:       number;
  description: string;
  catId:       string;
  image?:      string;   // undefined → placeholder gris en Vista Grid/Mesas
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export const CAT_DEFS: CatDef[] = [
  // Figma: #080eff
  { id: 'entradas-frias',     name: 'Entradas Frías',      color: '#080eff', lightBg: 'rgba(8,14,255,0.07)',   darkText: '#1F2937', darkColor: '#0407b3', merlinBg: 'rgba(8,14,255,0.04)',   merlinNameColor: '#030480', merlinCountColor: '#080eff', lineColor: '#080eff' },
  // Figma: #ff5500
  { id: 'entradas-calientes', name: 'Entradas Calientes',  color: '#ff5500', lightBg: 'rgba(255,85,0,0.07)',   darkText: '#1F2937', darkColor: '#cc4400', merlinBg: 'rgba(255,85,0,0.04)',   merlinNameColor: '#7a2900', merlinCountColor: '#cc4400', lineColor: '#ff5500' },
  // Figma: #ff9400
  { id: 'pastas',             name: 'Pastas & Risottos',   color: '#ff9400', lightBg: 'rgba(255,148,0,0.07)',  darkText: '#1F2937', darkColor: '#cc7600', merlinBg: 'rgba(255,148,0,0.04)',  merlinNameColor: '#7a4700', merlinCountColor: '#cc7600', lineColor: '#ff9400' },
  // Figma: #ff2dc8
  { id: 'carnes',             name: 'Carnes',               color: '#ff2dc8', lightBg: 'rgba(255,45,200,0.07)', darkText: '#1F2937', darkColor: '#cc24a0', merlinBg: 'rgba(255,45,200,0.04)', merlinNameColor: '#7a1560', merlinCountColor: '#cc24a0', lineColor: '#ff2dc8' },
  // Figma: #4401a9
  { id: 'pescados',           name: 'Pescados y Mariscos', color: '#4401a9', lightBg: 'rgba(68,1,169,0.07)',   darkText: '#1F2937', darkColor: '#360187', merlinBg: 'rgba(68,1,169,0.04)',   merlinNameColor: '#1a0052', merlinCountColor: '#360187', lineColor: '#4401a9' },
  // Figma: #b710de
  { id: 'postres',            name: 'Postres',              color: '#b710de', lightBg: 'rgba(183,16,222,0.07)', darkText: '#1F2937', darkColor: '#920db2', merlinBg: 'rgba(183,16,222,0.04)', merlinNameColor: '#570869', merlinCountColor: '#920db2', lineColor: '#b710de' },
  // Figma: #1c70d3
  { id: 'bebidas',            name: 'Bebidas',              color: '#1c70d3', lightBg: 'rgba(28,112,211,0.07)', darkText: '#1F2937', darkColor: '#1559aa', merlinBg: 'rgba(28,112,211,0.04)', merlinNameColor: '#0b3066', merlinCountColor: '#1559aa', lineColor: '#1c70d3' },
  // Figma: #b01207
  { id: 'sushi',              name: 'Sushi',                color: '#b01207', lightBg: 'rgba(176,18,7,0.07)',   darkText: '#1F2937', darkColor: '#8d0e06', merlinBg: 'rgba(176,18,7,0.04)',   merlinNameColor: '#540904', merlinCountColor: '#8d0e06', lineColor: '#b01207' },
  // Figma: #606060
  { id: 'desayunos',          name: 'Desayunos',            color: '#606060', lightBg: 'rgba(96,96,96,0.07)',   darkText: '#1F2937', darkColor: '#404040', merlinBg: 'rgba(96,96,96,0.04)',   merlinNameColor: '#2a2a2a', merlinCountColor: '#404040', lineColor: '#606060' },
];

// ─── Productos (56 total: 51 con imagen, 5 sin imagen) ────────────────────────

export const CAT_PRODUCTS: Record<string, CatalogProduct[]> = {
  'entradas-frias': [
    { id: 101, name: 'Carpaccio de Wagyu',      price: 112000, description: 'Láminas finas de res A5 con emulsión de trufa',         catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1719329466280-30d8a22e7cb5?q=80&w=800' },
    { id: 102, name: 'Tartar de Atún Bluefin',  price: 104000, description: 'Atún con aguacate y perlas de soja',                    catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1761314015346-ba8a0d11d158?q=80&w=800' },
    { id: 103, name: 'Ceviche de Corvina Real', price: 96000,  description: 'Leche de tigre al ají amarillo y camote',               catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1761314036959-42fa6eac59db?q=80&w=800' },
    { id: 104, name: 'Burrata Ahumada',         price: 88000,  description: 'Tomates heirloom confitados y pesto de pistacho',       catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1744835896651-93493e7d2ffc?q=80&w=800' },
    { id: 105, name: 'Ostras Fine de Claire',   price: 128000, description: 'Seis unidades con mignonette y caviar cítrico',         catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1737479212469-abd4d0edb21d?q=80&w=800' },
    { id: 106, name: 'Gazpacho de Cerezas',     price: 72000,  description: 'Sopa fría con nieve de queso de cabra',                 catId: 'entradas-frias' /* sin imagen */ },
    { id: 107, name: 'Foie Gras en Brioche',    price: 120000, description: 'Mousse de foie con mermelada de higos',                 catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1591703508999-b36a7f46ba83?q=80&w=800' },
    { id: 108, name: 'Ensalada de Centollo',    price: 116000, description: 'Carne de centollo con mayonesa de plancton',            catId: 'entradas-frias',    image: 'https://images.unsplash.com/photo-1750943082458-96205a2111ef?q=80&w=800' },
  ],
  'entradas-calientes': [
    { id: 111, name: 'Vieiras Selladas',          price: 108000, description: 'Puré de coliflor tostada y aire de azafrán',         catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1651718543197-f567aeaa4fb0?q=80&w=800' },
    { id: 112, name: 'Pulpo a la Brasa',          price: 100000, description: 'Marinado en pimentón con espuma de patata',           catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1626232442070-46902c617ec6?q=80&w=800' },
    { id: 113, name: 'Huevo a Baja Temperatura',  price: 84000,  description: 'Con setas silvestres y crema de foie',               catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1667385628414-9cd36f3f2fe5?q=80&w=800' },
    { id: 114, name: 'Ravioli de Langosta',       price: 112000, description: 'Relleno de bogavante con bisque de corales',          catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1758796626175-cfbb6ed524d5?q=80&w=800' },
    { id: 115, name: 'Tuétano Rostizado',         price: 92000,  description: 'Con ensalada de perejil y masa madre',               catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1639150362147-00e4cee6b3f5?q=80&w=800' },
    { id: 116, name: 'Sopa de Cebolla Moderna',   price: 76000,  description: 'Caldo clarificado con nube de Gruyère',              catId: 'entradas-calientes' /* sin imagen */ },
    { id: 117, name: 'Langostinos al Josper',     price: 104000, description: 'Mantequilla de ajo negro y lima kaffir',             catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1758972572427-fc3d4193bbd2?q=80&w=800' },
    { id: 118, name: 'Mollejas de Ternera',       price: 96000,  description: 'Crujientes con puré de manzana ácida',               catId: 'entradas-calientes', image: 'https://images.unsplash.com/photo-1705948730553-3ea0c89ae6fb?q=80&w=800' },
  ],
  'pastas': [
    { id: 121, name: 'Risotto de Trufa Blanca',   price: 180000, description: 'Arroz Carnaroli con láminas de trufa blanca',        catId: 'pastas', image: 'https://images.unsplash.com/photo-1707313829962-28409766bd7d?q=80&w=800' },
    { id: 122, name: 'Tagliatelle de Cacao',      price: 128000, description: 'Pasta de cacao con ragú de jabalí',                  catId: 'pastas', image: 'https://images.unsplash.com/photo-1734356959885-54fe2e99c1cd?q=80&w=800' },
    { id: 123, name: 'Gnocchi de Calabaza',       price: 112000, description: 'Salvia frita y mantequilla avellanada',              catId: 'pastas', image: 'https://images.unsplash.com/photo-1747628857843-96f695316cfc?q=80&w=800' },
    { id: 124, name: 'Risotto de Frutti di Mare', price: 152000, description: 'Mariscos premium e infusión de tomate',              catId: 'pastas', image: 'https://images.unsplash.com/photo-1746449766928-b4efa792d88c?q=80&w=800' },
    { id: 125, name: 'Pappardelle con Cordero',   price: 136000, description: 'Estofado de 12 horas y romero',                     catId: 'pastas', image: 'https://images.unsplash.com/photo-1641394535269-dbea1fa94ff1?q=80&w=800' },
    { id: 126, name: 'Agnolotti del Plin',        price: 120000, description: 'Rellenos de tres carnes con salsa de asado',         catId: 'pastas', image: 'https://images.unsplash.com/photo-1613634333954-085b019d87b7?q=80&w=800' },
    { id: 127, name: 'Risotto de Espárragos',     price: 116000, description: 'Guisantes lágrima y emulsión de hierbabuena',        catId: 'pastas', image: 'https://images.unsplash.com/photo-1579890246476-5e325aad9c7c?q=80&w=800' },
    { id: 128, name: 'Linguine con Caviar',       price: 220000, description: 'Crema de limón Amalfi y caviar Ossetra',            catId: 'pastas', image: 'https://images.unsplash.com/photo-1629120865048-6d6ef3193997?q=80&w=800' },
  ],
  'carnes': [
    { id: 131, name: 'Solomillo Wellington',      price: 192000, description: 'Filete en hojaldre con duxelle de setas',            catId: 'carnes', image: 'https://images.unsplash.com/photo-1736520537688-1f1f06b71605?q=80&w=800' },
    { id: 132, name: 'Costillar de Cordero',      price: 184000, description: 'Costra de hierbas y ratatouille',                   catId: 'carnes', image: 'https://images.unsplash.com/photo-1678537880138-842c85c8c12c?q=80&w=800' },
    { id: 133, name: 'Entrecot Dry Aged',         price: 208000, description: 'Madurado 45 días con patatas fondant',              catId: 'carnes', image: 'https://images.unsplash.com/photo-1654879259483-af42804bd2bb?q=80&w=800' },
    { id: 134, name: 'Pato a la Naranja 2.0',     price: 168000, description: 'Puré de zanahoria al jengibre y Grand Marnier',     catId: 'carnes', image: 'https://images.unsplash.com/photo-1700324638718-dade543770fa?q=80&w=800' },
    { id: 135, name: 'Cochinillo Confitado',      price: 176000, description: 'Piel crujiente con puré de piña asada',             catId: 'carnes', image: 'https://images.unsplash.com/photo-1629600938295-080a35c50302?q=80&w=800' },
    { id: 136, name: 'Short Rib al Vino Tinto',   price: 160000, description: 'Braseado 24 horas con puré de colinabo',            catId: 'carnes', image: 'https://images.unsplash.com/photo-1630291078007-1bc14b4b64a6?q=80&w=800' },
    { id: 137, name: 'Codorniz Rellena',          price: 152000, description: 'Rellena de frutos secos con reducción de uvas',     catId: 'carnes', image: 'https://images.unsplash.com/photo-1611489142329-5f62cfa43e6e?q=80&w=800' },
    { id: 138, name: 'Tomahawk',                  price: 440000, description: '1.2 kg a la parrilla con mantequilla de hierbas',   catId: 'carnes', image: 'https://images.unsplash.com/photo-1633862033814-180f66b0bf76?q=80&w=800' },
    { id: 139, name: 'Tournedó Rossini',          price: 232000, description: 'Solomillo con foie gras y trufa negra',             catId: 'carnes', image: 'https://images.unsplash.com/photo-1690368574774-51e765aa18f4?q=80&w=800' },
  ],
  'pescados': [
    { id: 141, name: 'Bacalao Negro Gindara',     price: 192000, description: 'Marinado en miso con bok choy',                    catId: 'pescados', image: 'https://images.unsplash.com/photo-1584267814800-c9de7a2cfeac?q=80&w=800' },
    { id: 142, name: 'Lubina en Sal de Mar',      price: 180000, description: 'Filete salvaje con verduras baby',                  catId: 'pescados', image: 'https://images.unsplash.com/photo-1612426357506-8b66a851fbe6?q=80&w=800' },
    { id: 143, name: 'Salmón Escocés',            price: 152000, description: 'Costra de sésamo y puré de guisantes',             catId: 'pescados', image: 'https://images.unsplash.com/photo-1739785938237-73b3654200d5?q=80&w=800' },
    { id: 144, name: 'Turbot (Rodaballo)',         price: 208000, description: 'Salsa de champagne y uvas peladas',                catId: 'pescados', image: 'https://images.unsplash.com/photo-1760560077547-6f9709b91319?q=80&w=800' },
    { id: 145, name: 'Bogavante Thermidor',       price: 260000, description: 'Gratinado con mostaza antigua y brandy',           catId: 'pescados', image: 'https://images.unsplash.com/photo-1707995546451-26652656d51c?q=80&w=800' },
    { id: 146, name: 'Atún Rojo en Costra',       price: 168000, description: 'Sellado tataki con gel de ponzu',                  catId: 'pescados', image: 'https://images.unsplash.com/photo-1700705727167-9f230f3639b9?q=80&w=800' },
    { id: 147, name: 'Merluza de Pincho',         price: 144000, description: 'Confitada con pil-pil de sus pieles',              catId: 'pescados', image: 'https://images.unsplash.com/photo-1577004686904-1a4f118acf61?q=80&w=800' },
    { id: 148, name: 'Lenguado Meunière',         price: 176000, description: 'Mantequilla noisette y alcaparras',                catId: 'pescados', image: 'https://images.unsplash.com/photo-1583118289889-f9e5ee78c82a?q=80&w=800' },
  ],
  'postres': [
    { id: 151, name: 'Esfera de Chocolate Oro',   price: 72000,  description: 'Valrhona fundido con salsa de caramelo',           catId: 'postres', image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=800' },
    { id: 152, name: 'Soufflé de Grand Marnier',  price: 64000,  description: 'Horneado con crema inglesa de vainilla',           catId: 'postres', image: 'https://images.unsplash.com/photo-1768341857441-9084cfd8676e?q=80&w=800' },
    { id: 153, name: 'Tarta Tatín de Manzana',    price: 60000,  description: 'Manzanas caramelizadas con helado de nata',        catId: 'postres', image: 'https://images.unsplash.com/photo-1644893748116-8e6c1523c44d?q=80&w=800' },
    { id: 154, name: 'Panna Cotta de Lavanda',    price: 56000,  description: 'Con flores frescas y panal de abeja',              catId: 'postres', image: 'https://images.unsplash.com/photo-1683104012661-0233922472a1?q=80&w=800' },
    { id: 155, name: 'Texturas de Avellana',      price: 68000,  description: 'Gianduja con praliné crujiente',                   catId: 'postres', image: 'https://images.unsplash.com/photo-1661295469956-ebde4fb31910?q=80&w=800' },
    { id: 156, name: 'Degustación de Quesos',     price: 88000,  description: 'Cinco quesos europeos con miel de trufa',          catId: 'postres', image: 'https://images.unsplash.com/photo-1669908978664-485e69bc26cd?q=80&w=800' },
    { id: 157, name: 'Lemon Pie Deconstruido',    price: 56000,  description: 'Crema de limón Meyer y merengue italiano',         catId: 'postres', image: 'https://images.unsplash.com/photo-1706799419648-98bc0334408c?q=80&w=800' },
    { id: 158, name: 'Tiramisú de Autor',         price: 60000,  description: 'Mascarpone artesano y café Cold Brew',             catId: 'postres', image: 'https://images.unsplash.com/photo-1763585055888-9eb25fe6c997?q=80&w=800' },
    { id: 159, name: 'Sorbetes Artesanales',      price: 48000,  description: 'Trío de sabores de temporada',                    catId: 'postres' /* sin imagen */ },
  ],
  'bebidas': [
    { id: 161, name: 'Limonada de Lavanda',       price: 36000,  description: 'Limonada artesanal infusionada con flores frescas',catId: 'bebidas', image: 'https://images.unsplash.com/photo-1701875379650-d632c0575b54?q=80&w=800' },
    { id: 162, name: 'Agua de Piedra',            price: 32000,  description: 'Agua mineral de manantial premium 750ml',          catId: 'bebidas' /* sin imagen */ },
    { id: 163, name: 'Infusión de Rooibos',       price: 40000,  description: 'Té sin teína con trozos de fruta orgánica',        catId: 'bebidas' /* sin imagen */ },
    { id: 164, name: 'Mocktail de Pepino',        price: 48000,  description: 'Refresco botánico sin alcohol macerado en frío',   catId: 'bebidas', image: 'https://images.unsplash.com/photo-1686753544049-659939f6038f?q=80&w=800' },
    { id: 165, name: 'Ginger Beer Artesanal',     price: 36000,  description: 'Elaborada en casa con fermentación natural',       catId: 'bebidas', image: 'https://images.unsplash.com/photo-1635232613883-5624a74048c4?q=80&w=800' },
    { id: 166, name: 'Néctar de Pera',            price: 44000,  description: 'Zumo natural especiado con cardamomo verde',       catId: 'bebidas', image: 'https://images.unsplash.com/photo-1619506147154-01717498fc26?q=80&w=800' },
  ],
  'sushi': [
    { id: 171, name: 'Nigiri de Salmón',          price: 48000,  description: 'Arroz de sushi con láminas de salmón fresco',      catId: 'sushi', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800' },
    { id: 172, name: 'Roll Philadelphia',         price: 56000,  description: 'Salmón, queso crema y pepino en alga nori',        catId: 'sushi', image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?q=80&w=800' },
    { id: 173, name: 'Sashimi de Atún',           price: 64000,  description: 'Láminas de atún rojo con salsa ponzu',             catId: 'sushi', image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?q=80&w=800' },
    { id: 174, name: 'Tempura Roll',              price: 60000,  description: 'Langostino tempura con aguacate y sriracha mayo',  catId: 'sushi', image: 'https://images.unsplash.com/photo-1617196034099-ab50f436a5a3?q=80&w=800' },
  ],
  'desayunos': [
    { id: 181, name: 'Huevos Benedictinos',       price: 68000,  description: 'Con jamón ibérico, salsa holandesa y pan brioche',  catId: 'desayunos', image: 'https://images.unsplash.com/photo-1608039858788-667850f129f9?q=80&w=800' },
    { id: 182, name: 'Pancakes de Avena',         price: 52000,  description: 'Con arándanos frescos, miel y mantequilla de avellana', catId: 'desayunos', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800' },
    { id: 183, name: 'Croissant de Mantequilla', price: 36000,  description: 'Hojaldrado artesanal con mermelada de frambuesa',   catId: 'desayunos', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800' },
    { id: 184, name: 'Granola Artesanal',         price: 48000,  description: 'Con yogur griego, frutas frescas y semillas tostadas', catId: 'desayunos', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=800' },
  ],
};

/** Todos los productos en array plano */
export const ALL_CATALOG_PRODUCTS: CatalogProduct[] =
  Object.values(CAT_PRODUCTS).flat();

/**
 * IDs de productos marcados como favoritos por el comercio.
 * Aparecen en el tab "★ Favoritos" de la Vista Grid (Mostrador y Mesas).
 * Carpaccio de Wagyu · Ceviche de Corvina Real · Risotto de Trufa Blanca
 * Solomillo Wellington · Tomahawk · Lubina en Sal de Mar
 * Tiramisú de Autor · Limonada de Lavanda
 */
export const FAVORITE_IDS: Set<number> = new Set([101, 103, 121, 131, 138, 142, 158, 161]);

/** Productos favoritos en orden de aparición en el catálogo */
export const FAVORITE_PRODUCTS: CatalogProduct[] =
  ALL_CATALOG_PRODUCTS.filter(p => FAVORITE_IDS.has(p.id));

/** Encuentra la definición de categoría por id */
export function getCatDef(catId: string): CatDef | undefined {
  return CAT_DEFS.find(c => c.id === catId);
}