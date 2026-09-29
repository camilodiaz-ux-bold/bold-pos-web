# SPEC — Checkout: pantalla "Venta Completada" e impresión de factura
### Bold POS Restaurantes — prototipo `bold-pos-web`

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Repo** | `camilodiaz-ux-bold/bold-pos-web` |
| **Versión** | 1.0 |
| **Fecha** | Septiembre 2026 |
| **Autor** | Producto — Bold POS Restaurantes |
| **Antecedente** | [`specs/2026-09-combos.md`](./2026-09-combos.md) (v2.0, ✅ Implementado) — este documento **complementa puntualmente su §7.5** (checkout): el combo sigue siendo una sola línea con precio fijo, pero ahora **sí se desglosa en la factura impresa**. El resto de ese spec sigue vigente. |

> **Nota:** `2026-09-combos.md` está congelado y no se reabre (convención de `specs/README.md`).

---

## 1. Qué cambia

**Antes:** al confirmar el pago, `CheckoutDrawer` mostraba un recibo a pantalla completa ("¡Completaste el pago!") con dos botones: "Enviar" (solo un toast) y "Nueva venta". No existía impresión real en ningún flujo del prototipo.

**Ahora:**
1. Al confirmar el pago se **libera la mesa / vacía la orden**, se cierra el checkout y se abre un **panel lateral derecho "Venta Completada"** sobre la vista de Mesas o Mostrador.
2. El panel tiene dos acciones funcionales: **Imprimir factura** y **Nueva venta**.
3. La factura impresa es un **ticket térmico de 80 mm** basado en `Factura-POS-Restaurantes.pdf`, con los **combos desglosados**.

## 2. Panel "Venta Completada"

- Título, ícono de check, total de la venta.
- Campo de correo (precargado con el correo del cliente) + "Enviar", y campo de teléfono + "Enviar"; link "O busca en tus contactos guardados en whatsapp" y "Abrir caja registradora". **Estos cuatro elementos son solo visuales** (muestran un toast) — se implementan en un spec posterior.
- **Imprimir factura** (outline): abre el diálogo de impresión con el ticket.
- **Nueva venta** (coral): cierra el panel y vuelve a la vista de ventas lista para una venta nueva. En Mesas deja el mapa sin mesa seleccionada; en Mostrador deja la orden vacía.
- El panel no tiene botón de cierre aparte: la salida es "Nueva venta".

## 3. Factura impresa

Estructura (del PDF de referencia): logo → "Factura Electrónica de Venta / No. SETT nnnnnnn" → datos del emisor → datos del cliente → fecha de emisión y de validación → tabla de ítems → totales → "Son: … Pesos Con Cero Centavos" → notas → Orden No. → forma y medio de pago.

Decisiones propias del prototipo:

- **Emisor:** datos mock del PDF (BOLD.CO S.A.S, NIT 901.281.572-4) en `src/app/data/invoiceIssuer.ts`, con el logo Bold.
- **Consecutivo:** arranca en `SETT 2400418` y aumenta en 1 por venta (persistido en localStorage). Se asigna una sola vez al confirmar el pago, no en cada impresión.
- **Cliente:** el checkout guarda el cliente como texto. Si tiene la forma `Nombre (NIT: x)` se imprime con tipo de documento NIT; en otro caso, `Cédula de Ciudadanía` / `222222222222`. Dirección, teléfono y correo son mock.
- **Propina:** el "Recargo" del PDF se imprime como **"Propina (10%)"** (o "Propina" si se editó a mano), y solo aparece si es mayor que cero.
- **Número de orden:** la línea "Orden No." imprime el mismo número que la comanda de cocina (`#885` en Mesas, `#001` en Mostrador), para poder cruzar ambos documentos.
- **Restaurante:** se agregan las líneas **Mesa** (solo en ventas de Mesas) y **Mesero** junto a "Orden No.".
- **IVA:** fijo 19%, igual que el cálculo actual del checkout. Descuento: `$ 0,00` (el descuento real está fuera de alcance).
- **Formato de montos:** `$ 100.000,00`.

### 3.1 Combos desglosados

Una línea de combo se imprime con su precio fijo y, debajo, un renglón por componente **sin precio**:

```
3   1.00   I-42854937856 - Combo Ejecutivo Mediodía
    UND    $ 250.000,00                  $ 250.000,00
           · 1 Ceviche de Corvina Real
           · 1 Salmón Escocés
           · 1 Limonada de Lavanda
```

La cantidad de cada componente es `cantidad del componente × cantidad de la línea` (mismo formato `· N nombre` de la comanda, ver `2026-09-combos.md` §7.4). El desglose no afecta subtotal, base imponible ni IVA.

## 4. Impresión

`printInvoice()` renderiza el ticket a HTML dentro de un iframe oculto con `@page { size: 80mm auto; margin: 0 }` y llama a `print()` sobre ese iframe. El diálogo de impresión del navegador solo ve el ticket, no la app. No se agregan librerías.

## 5. Fuera de alcance

Envío real por correo o WhatsApp, caja registradora, CUFE / código QR, impuestos por ítem (`impuestoId`), descuento real, persistencia de ventas, impresión real de comanda y pre-cuenta, y refactorizar las tres copias existentes del formato de desglose de combo.

## 6. Archivos

Nuevos: `components/SaleCompletedPanel.tsx`, `components/InvoiceTicket.tsx`, `utils/invoice.ts`, `utils/printInvoice.tsx`, `data/invoiceIssuer.ts`. Modificados: `components/CheckoutDrawer.tsx` (sin recibo; `onConfirmPay(sale)`), `components/MesasView.tsx`, `pages/HomePage.tsx`, `utils/comboBridge.ts` (`comboBreakdown`).
