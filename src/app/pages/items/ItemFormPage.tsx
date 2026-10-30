/**
 * ItemFormPage — Crear / Editar ítem. Una sola página para ambos modos;
 * el modo se deriva de si la ruta trae :id (useParams).
 *
 * Estado y validación: un solo objeto de formulario con useState (sin
 * react-hook-form ni Zod, no se usan en el proyecto). El cálculo
 * bidireccional precio base ↔ impuesto ↔ precio total ocurre dentro de
 * los propios setters, nunca en un useEffect que observe ambos campos
 * (evita un bucle de escritura mutua).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus, AlertTriangle } from 'lucide-react';
import { useItems } from '../../store/itemsStore';
import { useProductVariants, useVariantesCatalogo } from '../../store/variantesStore';
import type { Item, ItemDraft, ItemComboComponente, ItemTipoVariante, ItemVariante, SucursalId, UnidadId, ImpuestoId } from '../../types/item';
import { getVariantes } from '../../types/item';
import { getImpuesto, getUnidad } from '../../data/itemsCatalogs';
import { useCatalog, useVertical } from '../../vertical';
import { formatCOP, parseCOP } from '../../utils/format';
import { componentKey } from '../../utils/comboBridge';
import { sincronizarVariantes, type DefaultsVariante } from '../../utils/variantes';
import { TextField, TextAreaField, SelectField } from '../../components/items/FormField';
import { DisponibilidadCard } from '../../components/items/DisponibilidadCard';
import { ComboComponentsCard, useComboResolver } from '../../components/items/ComboComponentsCard';
import { CrearItemDrawer } from '../../components/compras/CrearItemDrawer';
import { ConfirmDeleteModal } from '../../components/items/ConfirmDeleteModal';
import { Toggle } from '../../components/items/Toggle';
import { VariantesCard } from '../../verticals/retail/items/VariantesCard';

interface FormState {
  nombre: string;
  categoriaId: string;
  descripcion: string;
  codigo: string;
  unidadId: UnidadId | '';
  referencia: string;
  precioBaseRaw: string;
  impuestoId: ImpuestoId | '';
  precioTotalRaw: string;
  costoRaw: string;
  imagen: string;
  manejaExistencias: boolean;
  sucursalIds: SucursalId[];
  existencias: Partial<Record<SucursalId, string>>;
  /** Alerta de stock bajo por sucursal (specs/2026-10-alertas-stock-disponibilidad.md §1). */
  stockBajo: Partial<Record<SucursalId, string>>;
  alertas: Partial<Record<SucursalId, boolean>>;
  esCombo: boolean;
  componentes: ItemComboComponente[];
  /** Retail: el ítem tiene variantes (card "Variantes disponibles", specs/2026-10-variantes-modelo.md). */
  conVariantes: boolean;
  mismoPrecio: boolean;
  tiposVariante: ItemTipoVariante[];
  variantes: ItemVariante[];
}

const EMPTY_FORM: FormState = {
  nombre: '', categoriaId: '', descripcion: '', codigo: '', unidadId: '', referencia: '',
  precioBaseRaw: '', impuestoId: 'iva-19', precioTotalRaw: '', costoRaw: '', imagen: '',
  manejaExistencias: false, sucursalIds: [], existencias: {}, stockBajo: {}, alertas: {},
  esCombo: false, componentes: [],
  conVariantes: false, mismoPrecio: false, tiposVariante: [], variantes: [],
};

// Única fuente de verdad para "Item → FormState de edición" — usada tanto en el
// initializer de useState como en el snapshot de isDirty, para que nunca puedan
// divergir (si divergen, el formulario queda permanentemente "sucio").
function toFormState(item: Item): FormState {
  return {
    nombre: item.nombre,
    categoriaId: item.categoriaId,
    descripcion: item.descripcion,
    codigo: item.codigo,
    unidadId: item.unidadId,
    referencia: item.referencia,
    precioBaseRaw: String(item.precioBase),
    impuestoId: item.impuestoId,
    precioTotalRaw: String(item.precioTotal),
    costoRaw: item.costo ? String(item.costo) : '',
    imagen: item.imagen ?? '',
    manejaExistencias: item.manejaExistencias,
    sucursalIds: item.sucursales.map(s => s.sucursalId),
    existencias: Object.fromEntries(item.sucursales.map(s => [s.sucursalId, String(s.existencia)])),
    stockBajo: Object.fromEntries(item.sucursales.filter(s => s.stockBajo !== undefined).map(s => [s.sucursalId, String(s.stockBajo)])),
    alertas: Object.fromEntries(item.sucursales.filter(s => s.alerta).map(s => [s.sucursalId, true])),
    esCombo: item.esCombo,
    componentes: item.componentes ?? [],
    conVariantes: !!getVariantes(item),
    mismoPrecio: item.mismoPrecioVariantes ?? false,
    tiposVariante: item.tiposVariante ?? [],
    variantes: item.variantes ?? [],
  };
}

export function ItemFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { getItem, createItem, updateItem } = useItems();
  const { catDefs: CAT_DEFS, unidades: UNIDADES, impuestos: IMPUESTOS } = useCatalog();
  const productVariants = useProductVariants();
  const { tipos: tiposCatalogo, createTipo } = useVariantesCatalogo();
  const { has } = useVertical();
  const mode: 'create' | 'edit' = id ? 'edit' : 'create';
  const existingItem = id ? getItem(id) : undefined;

  // Un combo ya guardado no se puede volver a convertir en ítem normal — el
  // toggle se bloquea solo en edición, y solo si el ítem YA era combo al
  // entrar al formulario (uno simple sí se puede marcar como combo, §9).
  const comboLocked = mode === 'edit' && !!existingItem?.esCombo;
  // Pestañas "Ítem simple" | "Combo" (specs/2026-10-items-crear-tabs.md). En edición de un
  // combo, "Ítem simple" queda bloqueada (specs/2026-09-combos-conversion-irreversible.md).

  // lastEditedPrice: qué campo dispara el recálculo del otro cuando cambia el impuesto.
  const lastEditedPrice = useRef<'base' | 'total'>(mode === 'edit' ? 'total' : 'base');

  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && existingItem ? toFormState(existingItem) : EMPTY_FORM);

  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showCrearItem, setShowCrearItem] = useState(false);
  const { sumOf, costSumOf } = useComboResolver();
  // El costo de un combo arranca como la suma de los costos de sus ítems, hasta que el usuario lo edite.
  const costoTouched = useRef(mode === 'edit');

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setPrecioBase = (raw: string) => {
    const rate = getImpuesto(form.impuestoId)?.rate ?? 0;
    const base = parseCOP(raw);
    lastEditedPrice.current = 'base';
    const total = Math.round(base * (1 + rate));
    setForm(prev => ({
      ...prev, precioBaseRaw: raw, precioTotalRaw: String(total),
      variantes: prev.conVariantes && prev.mismoPrecio ? prev.variantes.map(v => ({ ...v, precioBase: base, precioTotal: total })) : prev.variantes,
    }));
  };

  const setPrecioTotal = (raw: string) => {
    const rate = getImpuesto(form.impuestoId)?.rate ?? 0;
    const total = parseCOP(raw);
    lastEditedPrice.current = 'total';
    const base = Math.round(total / (1 + rate));
    setForm(prev => ({
      ...prev, precioTotalRaw: raw, precioBaseRaw: String(base),
      variantes: prev.conVariantes && prev.mismoPrecio ? prev.variantes.map(v => ({ ...v, precioBase: base, precioTotal: total })) : prev.variantes,
    }));
  };

  const setImpuesto = (impuestoId: string) => {
    const rate = getImpuesto(impuestoId)?.rate ?? 0;
    setForm(prev => {
      // Con variantes el precio total de cada una se conserva y se recalcula su base (spec variantes §2).
      const variantes = prev.conVariantes
        ? prev.variantes.map(v => ({ ...v, precioBase: Math.round(v.precioTotal / (1 + rate)) }))
        : prev.variantes;
      if (lastEditedPrice.current === 'base' && !prev.conVariantes) {
        const base = parseCOP(prev.precioBaseRaw);
        return { ...prev, impuestoId: impuestoId as ImpuestoId, precioTotalRaw: String(Math.round(base * (1 + rate))), variantes };
      }
      const total = parseCOP(prev.precioTotalRaw);
      return { ...prev, impuestoId: impuestoId as ImpuestoId, precioBaseRaw: String(Math.round(total / (1 + rate))), variantes };
    });
  };

  // ── Variantes (Retail) ──
  const defaultsVariante = (f: FormState): DefaultsVariante => {
    const rate = getImpuesto(f.impuestoId)?.rate ?? 0;
    const ref = f.variantes.find(v => v.activo) ?? f.variantes[0];
    const total = f.mismoPrecio || !ref ? parseCOP(f.precioTotalRaw) : ref.precioTotal;
    return {
      precioBase: Math.round(total / (1 + rate)),
      precioTotal: total,
      costo: ref?.costo ?? parseCOP(f.costoRaw),
      sucursales: f.manejaExistencias ? [{ sucursalId: 'principal', existencia: 0 }] : [],
    };
  };
  const agregarVariantes = () => setForm(prev => ({ ...prev, conVariantes: true, mismoPrecio: false, tiposVariante: [], variantes: [] }));
  const quitarVariantes = () => setForm(prev => ({ ...prev, conVariantes: false, mismoPrecio: false, tiposVariante: [], variantes: [] }));
  const setTiposVariante = (tipos: ItemTipoVariante[], reiniciar = false) =>
    setForm(prev => ({
      ...prev,
      tiposVariante: tipos,
      variantes: tipos.length === 0 ? [] : sincronizarVariantes(prev.variantes, tipos, defaultsVariante(prev), reiniciar),
    }));
  const setManejaVariantes = (next: boolean) =>
    setForm(prev => ({
      ...prev,
      manejaExistencias: next,
      // Al activar, cada variante parte con la sucursal principal para que sea válida.
      variantes: next ? prev.variantes.map(v => (v.sucursales.length ? v : { ...v, sucursales: [{ sucursalId: 'principal', existencia: 0 }] })) : prev.variantes,
    }));
  const toggleMismoPrecio = (next: boolean) =>
    setForm(prev => {
      if (!next) return { ...prev, mismoPrecio: false };
      const rate = getImpuesto(prev.impuestoId)?.rate ?? 0;
      const ref = prev.variantes.find(v => v.activo) ?? prev.variantes[0];
      const total = ref?.precioTotal ?? parseCOP(prev.precioTotalRaw);
      const base = Math.round(total / (1 + rate));
      return {
        ...prev, mismoPrecio: true, precioTotalRaw: String(total), precioBaseRaw: String(base),
        variantes: prev.variantes.map(v => ({ ...v, precioBase: base, precioTotal: total })),
      };
    });
  const toggleVarianteActivo = (vid: string) =>
    setForm(prev => ({ ...prev, variantes: prev.variantes.map(v => (v.id === vid ? { ...v, activo: !v.activo } : v)) }));
  const updateVariante = (nueva: ItemVariante) =>
    setForm(prev => ({ ...prev, variantes: prev.variantes.map(v => (v.id === nueva.id ? nueva : v)) }));

  const toggleSucursal = (sucursalId: SucursalId) => {
    setForm(prev => {
      const has = prev.sucursalIds.includes(sucursalId);
      const sucursalIds = has ? prev.sucursalIds.filter(s => s !== sucursalId) : [...prev.sucursalIds, sucursalId];
      const existencias = { ...prev.existencias };
      const stockBajo = { ...prev.stockBajo };
      const alertas = { ...prev.alertas };
      if (has) { delete existencias[sucursalId]; delete stockBajo[sucursalId]; delete alertas[sucursalId]; }
      return { ...prev, sucursalIds, existencias, stockBajo, alertas };
    });
  };

  const setExistencia = (sucursalId: SucursalId, raw: string) => {
    setForm(prev => ({ ...prev, existencias: { ...prev.existencias, [sucursalId]: raw } }));
  };

  // Alerta de stock bajo: activar el check sin valor lo deja en 0; borrar el valor apaga la alerta (igual que en Alertas de Stock).
  const setStockBajo = (sucursalId: SucursalId, raw: string) => {
    setForm(prev => ({
      ...prev,
      stockBajo: { ...prev.stockBajo, [sucursalId]: raw },
      alertas: raw.trim() === '' ? { ...prev.alertas, [sucursalId]: false } : prev.alertas,
    }));
  };
  const setAlerta = (sucursalId: SucursalId, activa: boolean) => {
    setForm(prev => ({
      ...prev,
      alertas: { ...prev.alertas, [sucursalId]: activa },
      stockBajo: activa && (prev.stockBajo[sucursalId] ?? '').trim() === '' ? { ...prev.stockBajo, [sucursalId]: '0' } : prev.stockBajo,
    }));
  };

  // Un combo no maneja existencias propias — al marcarlo, se apaga
  // manejaExistencias y se limpian las existencias numéricas (caso borde §9:
  // un ítem simple con existencias que se convierte en combo). Las sucursales
  // seleccionadas SÍ se conservan: un combo puede estar activo en unas
  // sucursales y no en otras, aunque no lleve un número de existencia propio.
  const setEsCombo = (next: boolean) => {
    setForm(prev => next
      ? { ...prev, esCombo: next, manejaExistencias: false, existencias: {}, stockBajo: {}, alertas: {} }
      : { ...prev, esCombo: next });
  };

  const unidadLabel = getUnidad(form.unidadId)?.label ?? 'Unidades';

  const sucursalesError = form.sucursalIds.length === 0 ? 'Selecciona al menos una sucursal' : undefined;
  const costoSumaItems = form.esCombo ? costSumOf(form.componentes) : 0;
  useEffect(() => {
    if (!form.esCombo || costoTouched.current) return;
    setForm(prev => {
      const next = costoSumaItems > 0 ? String(costoSumaItems) : '';
      return prev.costoRaw === next ? prev : { ...prev, costoRaw: next };
    });
  }, [form.esCombo, costoSumaItems]);

  const sumaItems = form.esCombo ? sumOf(form.componentes) : 0;
  const precioTotalNum = parseCOP(form.precioTotalRaw);
  const diffPrecio = precioTotalNum - sumaItems;
  const showPrecioAviso = form.esCombo && form.componentes.length > 0 && precioTotalNum > 0 && diffPrecio !== 0;

  // Identidad de un componente: la variante si la tiene, si no el producto (Restaurantes, o producto sin variantes).
  const componenteKey = componentKey;
  const addComponente = (ref: { productId?: number; itemId?: string; variantId?: string }) => {
    const nuevo: ItemComboComponente = { ...ref, cantidad: 1 };
    setForm(prev => prev.componentes.some(c => componenteKey(c) === componenteKey(nuevo))
      ? prev
      : { ...prev, componentes: [...prev.componentes, nuevo] });
  };
  const changeComponenteCantidad = (key: string, cantidad: number) => {
    setForm(prev => ({
      ...prev,
      componentes: prev.componentes.map(c => componenteKey(c) === key ? { ...c, cantidad } : c),
    }));
  };
  const removeComponente = (key: string) => {
    setForm(prev => ({ ...prev, componentes: prev.componentes.filter(c => componenteKey(c) !== key) }));
  };

  const isValid = useMemo(() => {
    const precioBase = parseCOP(form.precioBaseRaw);
    if (form.nombre.trim().length < 2) return false;
    if (!form.categoriaId || !form.unidadId || !form.impuestoId) return false;
    if (form.conVariantes) {
      // Con variantes el precio, el costo y la existencia viven en cada una (specs/2026-10-variantes-modelo.md §2).
      const activas = form.variantes.filter(v => v.activo);
      return form.tiposVariante.length > 0 && activas.length > 0
        && activas.every(v => v.precioBase > 0 && (!form.manejaExistencias || v.sucursales.length > 0));
    }
    if (precioBase <= 0) return false;
    // Un combo también exige al menos una sucursal — puede seleccionarlas,
    // solo no puede activar el toggle de existencias (ver setEsCombo).
    if (form.sucursalIds.length === 0) return false;
    if (form.manejaExistencias) {
      const allFilled = form.sucursalIds.every(sid => {
        const raw = form.existencias[sid];
        return raw !== undefined && raw !== '' && Number.isInteger(parseInt(raw, 10));
      });
      if (!allFilled) return false;
      // El stock bajo es opcional, pero si se escribe debe ser un entero ≥ 0.
      if (form.sucursalIds.some(sid => { const raw = (form.stockBajo[sid] ?? '').trim(); return raw !== '' && !/^\d+$/.test(raw); })) return false;
    }
    if (form.esCombo) {
      if (form.componentes.length < 2) return false;
      if (has('variantes') && form.componentes.some(c => c.productId !== undefined && productVariants[c.productId] && !c.variantId)) return false;
      if (form.componentes.some(c => !Number.isInteger(c.cantidad) || c.cantidad < 1)) return false;
    }
    return true;
  }, [form, has, productVariants]);

  const isDirty = mode === 'create'
    ? form.nombre !== '' || form.categoriaId !== ''
    : !!existingItem && JSON.stringify(form) !== JSON.stringify(toFormState(existingItem));

  const handleBack = () => {
    if (isDirty) setShowDiscardModal(true);
    else navigate('/items');
  };

  const handleSave = () => {
    if (!isValid) return;
    // Ítem con variantes: el precio y el costo del padre siguen a la primera variante activa; la existencia
    // vive en cada variante y el ítem no guarda sucursales propias.
    const varianteRef = form.conVariantes ? (form.variantes.find(v => v.activo) ?? form.variantes[0]) : undefined;
    const draft: ItemDraft = {
      codigo: form.codigo,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      referencia: form.referencia.trim(),
      categoriaId: form.categoriaId,
      unidadId: form.unidadId as UnidadId,
      impuestoId: form.impuestoId as ImpuestoId,
      precioBase: varianteRef ? varianteRef.precioBase : parseCOP(form.precioBaseRaw),
      precioTotal: varianteRef ? varianteRef.precioTotal : parseCOP(form.precioTotalRaw),
      costo: varianteRef ? varianteRef.costo : parseCOP(form.costoRaw),
      // Un combo nunca guarda existencia propia, sin importar el estado del
      // form — red de seguridad además del reset en setEsCombo. Sí conserva
      // sus sucursales seleccionadas (specs/2026-09-combos-disponibilidad.md).
      manejaExistencias: form.esCombo ? false : form.manejaExistencias,
      sucursales: form.conVariantes ? [] : form.sucursalIds.map(sucursalId => ({
        sucursalId,
        existencia: form.manejaExistencias ? parseInt(form.existencias[sucursalId] ?? '0', 10) || 0 : 0,
        // La alerta solo existe con existencias y con umbral definido; sin valor, no se guarda ninguno.
        ...(form.manejaExistencias && !form.esCombo && (form.stockBajo[sucursalId] ?? '').trim() !== ''
          ? { stockBajo: parseInt(form.stockBajo[sucursalId] as string, 10), alerta: !!form.alertas[sucursalId] }
          : {}),
      })),
      tiposVariante: form.conVariantes ? form.tiposVariante : undefined,
      mismoPrecioVariantes: form.conVariantes ? form.mismoPrecio : undefined,
      variantes: form.conVariantes
        ? form.variantes.map(v => ({ ...v, sucursales: form.manejaExistencias ? v.sucursales : [] }))
        : undefined,
      activo: existingItem?.activo ?? true,
      imagen: form.imagen || undefined,
      esCombo: form.esCombo,
      // Se conserva aunque esCombo sea false: desmarcar el toggle no debe borrar
      // la lista, para que sea reversible sin pérdida de datos (spec §9).
      componentes: form.componentes.length > 0 ? form.componentes : undefined,
    };

    if (mode === 'edit' && id) {
      updateItem(id, draft);
      toast.success('Ítem actualizado');
    } else {
      createItem(draft);
      toast.success('Ítem creado');
    }
    navigate('/items');
  };

  const categoriaOptions = CAT_DEFS.map(c => ({ value: c.id, label: c.name }));
  const unidadOptions = UNIDADES.map(u => ({ value: u.id, label: u.label }));
  const impuestoOptions = IMPUESTOS.map(i => ({ value: i.id, label: i.label }));

  // ── Ítem no encontrado en modo edición (deep-link a un id borrado) ──
  // Placed after all hooks (Rules of Hooks) — mode/id no cambian sin remount de ruta.
  if (mode === 'edit' && !existingItem) {
    return (
      <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24 }}>
        <div className="empty-state" style={{ backgroundColor: '#fff', borderRadius: 16, marginTop: 40 }}>
          <p className="empty-state__title">Este ítem ya no existe</p>
          <button className="btn btn-primary btn--sm" onClick={() => navigate('/items')}>Volver a la lista</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--blue-10)', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 8, border: '1px solid var(--blue-20)',
            backgroundColor: '#fff', cursor: 'pointer', flexShrink: 0,
          }}
          className="hover:bg-[var(--blue-10)] transition-colors"
        >
          <ArrowLeft size={18} color="var(--blue-100)" strokeWidth={1.8} />
        </button>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, lineHeight: '28px', color: 'var(--black-100)', margin: 0 }}>
          {mode === 'edit' ? 'Editar' : 'Crear'} {form.esCombo ? 'combo' : 'ítem simple'}
        </p>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button className="btn btn-cancel" onClick={handleBack}>Cancelar</button>
          <button className="btn btn-primary" disabled={!isValid} onClick={handleSave}>
            {mode === 'edit' ? 'Guardar cambios' : form.esCombo ? 'Crear combo' : 'Crear ítem'}
          </button>
        </div>
      </div>

      {/* Tipo de ítem: Ítem simple | Combo */}
      <div role="tablist" style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--blue-20)' }}>
        {([['simple', 'Ítem simple', false], ['combo', 'Combo', true]] as const).map(([key, label, isCombo]) => {
          const active = form.esCombo === isCombo;
          const disabled = (comboLocked && !isCombo) || (form.conVariantes && isCombo);
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              title={disabled ? (isCombo ? 'Un ítem con variantes no puede ser un combo. Quita las variantes primero.' : 'Un combo no se puede convertir en un ítem normal después de creado.') : undefined}
              onClick={() => { if (!active) setEsCombo(isCombo); }}
              style={{
                padding: '10px 24px', background: 'none', border: 'none', marginBottom: -1,
                borderBottom: active ? '2px solid var(--blue-100)' : '2px solid transparent',
                fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: active ? 700 : 500,
                color: disabled ? 'var(--black-40)' : active ? 'var(--blue-100)' : 'var(--black-60)',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Cuerpo: 2 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>

        {/* Columna izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

          {/* Información general */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Información general</h3>
            <TextField label="Nombre del ítem" required value={form.nombre} onChange={v => set('nombre', v)} placeholder="Ingresa el nombre del ítem" />
            <SelectField
              label="Categoría" required value={form.categoriaId} onChange={v => set('categoriaId', v)}
              options={categoriaOptions} placeholder="Buscar..."
              action={{ label: 'Agregar categoría', onClick: () => toast.info('Agregar categoría — próximamente') }}
            />
            <TextAreaField label="Descripción" value={form.descripcion} onChange={v => set('descripcion', v)} placeholder="Escribe la descripción del ítem" />
            <SelectField label="Unidad" required value={form.unidadId} onChange={v => set('unidadId', v as UnidadId)} options={unidadOptions} clearable placeholder="Selecciona una unidad" />
          </div>

          {form.esCombo && (
            <ComboComponentsCard
              componentes={form.componentes}
              onAdd={addComponente}
              onChangeCantidad={changeComponenteCantidad}
              onRemove={removeComponente}
              onCreateItem={() => setShowCrearItem(true)}
            />
          )}

          {/* Precio de venta — con variantes, cada una trae el suyo (card "Variantes disponibles") */}
          {!form.conVariantes && (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Precio de venta</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 12, alignItems: 'end' }}>
              <TextField label="Precio base" required type="number" value={form.precioBaseRaw} onChange={setPrecioBase} placeholder="0" />
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--black-40)', paddingBottom: 10 }}>+</span>
              <SelectField label="Impuesto" required value={form.impuestoId} onChange={setImpuesto} options={impuestoOptions} placeholder="Buscar..." />
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--black-40)', paddingBottom: 10 }}>=</span>
              <TextField label="Precio total de venta" required type="number" value={form.precioTotalRaw} onChange={setPrecioTotal} placeholder="0" />
            </div>
            {showPrecioAviso && (
              <div
                role="note"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8,
                  backgroundColor: 'var(--coral-10)', color: 'var(--black-100)', fontSize: 12, lineHeight: '18px',
                }}
              >
                <AlertTriangle size={16} color="var(--coral-100)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>
                  {diffPrecio < 0
                    ? `Este precio es ${formatCOP(-diffPrecio)} menor que la suma de los ítems (${formatCOP(sumaItems)}). Venderás el combo con pérdida de ingreso.`
                    : `Este precio es ${formatCOP(diffPrecio)} mayor que la suma de los ítems (${formatCOP(sumaItems)}). Tus clientes pagarían más que comprándolos por separado.`}
                </span>
                <button
                  type="button"
                  className="btn btn-cancel btn--sm"
                  onClick={() => setPrecioTotal(String(sumaItems))}
                  style={{ flexShrink: 0 }}
                >
                  Usar {formatCOP(sumaItems)}
                </button>
              </div>
            )}
            <TextField label="Costo" type="number" value={form.costoRaw} onChange={v => { costoTouched.current = true; set('costoRaw', v); }} placeholder="0" helper="Ingresa el valor que te cuesta este ítem" />
            {/* Solo visual por ahora: el toggle no cambia de estado (specs/2026-10-listas-precios-variantes-form.md) */}
            {has('listas-precios') && (
              <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--black-100)' }}>Listas de precios</span>
                <Toggle checked={false} onChange={() => toast.info('Listas de precios — próximamente')} ariaLabel="Listas de precios" />
              </div>
            )}
          </div>
          )}

          {/* Variantes (Retail) — solo en la pestaña Ítem simple (un combo no tiene variantes) */}
          {has('variantes') && !form.esCombo && !form.conVariantes && (
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Variantes</h3>
              <div>
                <button
                  type="button"
                  onClick={agregarVariantes}
                  style={{
                    padding: '10px 16px', borderRadius: 8, border: 'none', backgroundColor: 'var(--black-10)',
                    color: 'var(--black-100)', fontFamily: "'Montserrat', sans-serif",
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Agregar variante
                </button>
              </div>
            </div>
          )}
          {has('variantes') && !form.esCombo && form.conVariantes && (
            <VariantesCard
              tiposCatalogo={tiposCatalogo}
              tiposVariante={form.tiposVariante}
              variantes={form.variantes}
              manejaExistencias={form.manejaExistencias}
              onToggleManeja={setManejaVariantes}
              mismoPrecio={form.mismoPrecio}
              onToggleMismoPrecio={toggleMismoPrecio}
              precioBaseRaw={form.precioBaseRaw}
              precioTotalRaw={form.precioTotalRaw}
              onChangePrecioBase={setPrecioBase}
              onChangePrecioTotal={setPrecioTotal}
              impuestoId={form.impuestoId}
              impuestoOptions={impuestoOptions}
              impuestoRate={getImpuesto(form.impuestoId)?.rate ?? 0}
              onChangeImpuesto={setImpuesto}
              unidadLabel={unidadLabel}
              itemNombre={form.nombre}
              onChangeTipos={setTiposVariante}
              onToggleVarianteActivo={toggleVarianteActivo}
              onUpdateVariante={updateVariante}
              onCrearTipo={draft => createTipo(draft)}
              onQuitarVariantes={quitarVariantes}
            />
          )}
        </div>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Imagen */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {form.imagen ? (
              <img src={form.imagen} alt={form.nombre} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 12, backgroundColor: 'var(--blue-10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ImagePlus size={32} color="var(--blue-40)" strokeWidth={1.5} />
              </div>
            )}
            <button
              type="button"
              className="btn btn-cancel btn--sm"
              onClick={() => toast.info('Agregar imagen — próximamente')}
            >
              Agregar imagen
            </button>
          </div>

          {/* Disponibilidad — un combo no maneja existencias propias, pero sí
              elige en qué sucursales está activo (specs/2026-09-combos-disponibilidad.md) */}
          {!form.conVariantes && (
          <DisponibilidadCard
            manejaExistencias={form.manejaExistencias}
            onToggleManeja={v => set('manejaExistencias', v)}
            sucursalIds={form.sucursalIds}
            onToggleSucursal={toggleSucursal}
            existencias={form.existencias}
            onChangeExistencia={setExistencia}
            stockBajo={form.stockBajo}
            onChangeStockBajo={setStockBajo}
            alertas={form.alertas}
            onChangeAlerta={setAlerta}
            unidadLabel={unidadLabel}
            sucursalesError={sucursalesError}
            existenciasDisabled={form.esCombo}
          />
          )}

          {/* Información adicional */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Información adicional</h3>
            <TextField label="Referencia" value={form.referencia} onChange={v => set('referencia', v)} placeholder="Ingresa una referencia" helper="Aparece en el comprobante de venta" />
            <TextField label="Código" value={form.codigo} onChange={v => set('codigo', v)} placeholder="Ingresa el código para el ítem" />
          </div>
        </div>
      </div>

      {showCrearItem && (
        <CrearItemDrawer
          onClose={() => setShowCrearItem(false)}
          onCreated={item => { addComponente({ itemId: item.id }); setShowCrearItem(false); }}
        />
      )}

      {showDiscardModal && (
        <ConfirmDeleteModal
          title="¿Descartar cambios?"
          message="Perderás los cambios que hiciste en este ítem."
          confirmLabel="Descartar"
          onCancel={() => setShowDiscardModal(false)}
          onConfirm={() => navigate('/items')}
        />
      )}
    </div>
  );
}
