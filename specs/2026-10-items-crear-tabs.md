# SPEC — Crear ítem con pestañas "Ítem simple" | "Combo"

| | |
|---|---|
| **Estado** | Listo para implementación |
| **Vertical** | Core (Retail y Restaurantes; Variantes y Listas de precios siguen siendo solo Retail) |
| **Ruta** | `/items/nuevo` y `/items/:id/editar` |
| **Antecedentes** | `2026-09-combos.md`, `2026-09-combos-disponibilidad.md`, `2026-09-combos-conversion-irreversible.md`, `2026-10-listas-precios-variantes-form.md` |

## Qué cambia

El formulario de ítem reemplaza el toggle "Es un combo" por dos pestañas bajo el título, y los campos siguen el Figma de Bold POS. El diseño visual (colores, tipografía) sigue siendo el de Merlin del repo.

- Título: "Crear ítem simple" / "Crear combo" (en edición: "Editar …"). Botón principal: "Crear ítem" / "Crear combo" / "Guardar cambios".
- **Ítem simple**: Información general (Nombre, Categoría + "Agregar categoría", Descripción, Unidad) · Precio de venta (Precio base + Impuesto = Precio total, Costo, Listas de precios solo Retail) · Variantes (solo Retail). Columna derecha: imagen ("Agregar imagen"), Disponibilidad (toggle "Ítem con existencias" + Sucursales) e Información adicional (Referencia y, debajo, Código — opcional; si va vacío se genera uno aleatorio único).
- **Combo**: Información general (mismos campos) · Ítems del combo · Precio de venta · sin Variantes. Disponibilidad solo con Sucursales (sin toggle de existencias).
- **Unidad** se conserva tal como estaba (obligatoria, en Información general, en ambas pestañas).

## Ítems del combo

- Selector "Ítems incluidos" ("Busca un ítem por nombre", ayuda "Agrega mínimo 2 ítems."). El desplegable abre con "+ Crear nuevo ítem" (reutiliza `CrearItemDrawer`; el ítem creado se agrega al combo) y lista nombre + precio.
- Cada ítem agregado: nombre, "$precio ( N un )", stepper de cantidad y papelera. Debajo, "Suma de los ítems".
- **Costo** del combo: por defecto es la suma de los costos de sus ítems (costo del Item propio o del Item sembrado del producto; una variante usa el de su producto, por cantidad). Se actualiza al agregar o quitar ítems hasta que el usuario edita el campo; en edición no se pisa.
- En Precio de venta, si el precio total difiere de la suma de los ítems aparece un aviso con botón "Usar $suma": "Este precio es $X menor que la suma de los ítems ($S). Venderás el combo con pérdida de ingreso." o "… mayor … Tus clientes pagarían más que comprándolos por separado."

## Reglas que se mantienen

- Un combo necesita al menos 2 ítems, cantidades enteras ≥ 1 y, en Retail, variante elegida en los productos que la tienen.
- Un combo guardado no vuelve a ser ítem simple: en edición la pestaña "Ítem simple" queda bloqueada. Un ítem simple sí puede pasar a combo.
- Al cambiar a Combo se apagan las existencias propias; las sucursales se conservan. Cambiar de pestaña no borra la lista de ítems.
