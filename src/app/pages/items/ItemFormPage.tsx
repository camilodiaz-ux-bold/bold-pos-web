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
import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import { useItems } from '../../store/itemsStore';
import type { Item, ItemDraft, ItemComboComponente, SucursalId, UnidadId, ImpuestoId } from '../../types/item';
import { UNIDADES, IMPUESTOS, getImpuesto, getUnidad } from '../../data/itemsCatalogs';
import { CAT_DEFS } from '../../data/productCatalog';
import { formatCOP, parseCOP } from '../../utils/format';
import { TextField, TextAreaField, SelectField } from '../../components/items/FormField';
import { DisponibilidadCard } from '../../components/items/DisponibilidadCard';
import { ComboComponentsCard } from '../../components/items/ComboComponentsCard';
import { ConfirmDeleteModal } from '../../components/items/ConfirmDeleteModal';
import { Toggle } from '../../components/items/Toggle';

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
  esCombo: boolean;
  componentes: ItemComboComponente[];
}

const EMPTY_FORM: FormState = {
  nombre: '', categoriaId: '', descripcion: '', codigo: '', unidadId: '', referencia: '',
  precioBaseRaw: '', impuestoId: 'iva-19', precioTotalRaw: '', costoRaw: '', imagen: '',
  manejaExistencias: false, sucursalIds: [], existencias: {},
  esCombo: false, componentes: [],
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
    esCombo: item.esCombo,
    componentes: item.componentes ?? [],
  };
}

export function ItemFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { getItem, createItem, updateItem } = useItems();
  const mode: 'create' | 'edit' = id ? 'edit' : 'create';
  const existingItem = id ? getItem(id) : undefined;

  // lastEditedPrice: qué campo dispara el recálculo del otro cuando cambia el impuesto.
  const lastEditedPrice = useRef<'base' | 'total'>(mode === 'edit' ? 'total' : 'base');

  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && existingItem ? toFormState(existingItem) : EMPTY_FORM);

  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const setPrecioBase = (raw: string) => {
    const rate = getImpuesto(form.impuestoId)?.rate ?? 0;
    const base = parseCOP(raw);
    lastEditedPrice.current = 'base';
    setForm(prev => ({ ...prev, precioBaseRaw: raw, precioTotalRaw: String(Math.round(base * (1 + rate))) }));
  };

  const setPrecioTotal = (raw: string) => {
    const rate = getImpuesto(form.impuestoId)?.rate ?? 0;
    const total = parseCOP(raw);
    lastEditedPrice.current = 'total';
    setForm(prev => ({ ...prev, precioTotalRaw: raw, precioBaseRaw: String(Math.round(total / (1 + rate))) }));
  };

  const setImpuesto = (impuestoId: string) => {
    const rate = getImpuesto(impuestoId)?.rate ?? 0;
    setForm(prev => {
      if (lastEditedPrice.current === 'base') {
        const base = parseCOP(prev.precioBaseRaw);
        return { ...prev, impuestoId: impuestoId as ImpuestoId, precioTotalRaw: String(Math.round(base * (1 + rate))) };
      }
      const total = parseCOP(prev.precioTotalRaw);
      return { ...prev, impuestoId: impuestoId as ImpuestoId, precioBaseRaw: String(Math.round(total / (1 + rate))) };
    });
  };

  const toggleSucursal = (sucursalId: SucursalId) => {
    setForm(prev => {
      const has = prev.sucursalIds.includes(sucursalId);
      const sucursalIds = has ? prev.sucursalIds.filter(s => s !== sucursalId) : [...prev.sucursalIds, sucursalId];
      const existencias = { ...prev.existencias };
      if (has) delete existencias[sucursalId];
      return { ...prev, sucursalIds, existencias };
    });
  };

  const setExistencia = (sucursalId: SucursalId, raw: string) => {
    setForm(prev => ({ ...prev, existencias: { ...prev.existencias, [sucursalId]: raw } }));
  };

  const unidadLabel = getUnidad(form.unidadId)?.label ?? 'Unidades';

  const sucursalesError = form.sucursalIds.length === 0 ? 'Selecciona al menos una sucursal' : undefined;
  const componentesError = form.esCombo && form.componentes.length < 2 ? 'Agrega al menos 2 componentes' : undefined;

  const addComponente = (productId: number) => {
    setForm(prev => prev.componentes.some(c => c.productId === productId)
      ? prev
      : { ...prev, componentes: [...prev.componentes, { productId, cantidad: 1 }] });
  };
  const changeComponenteCantidad = (productId: number, cantidad: number) => {
    setForm(prev => ({
      ...prev,
      componentes: prev.componentes.map(c => c.productId === productId ? { ...c, cantidad } : c),
    }));
  };
  const removeComponente = (productId: number) => {
    setForm(prev => ({ ...prev, componentes: prev.componentes.filter(c => c.productId !== productId) }));
  };

  const isValid = useMemo(() => {
    const precioBase = parseCOP(form.precioBaseRaw);
    if (form.nombre.trim().length < 2) return false;
    if (!form.categoriaId || !form.unidadId || !form.impuestoId) return false;
    if (precioBase <= 0) return false;
    if (form.sucursalIds.length === 0) return false;
    if (form.manejaExistencias) {
      const allFilled = form.sucursalIds.every(sid => {
        const raw = form.existencias[sid];
        return raw !== undefined && raw !== '' && Number.isInteger(parseInt(raw, 10));
      });
      if (!allFilled) return false;
    }
    if (form.esCombo) {
      if (form.componentes.length < 2) return false;
      if (form.componentes.some(c => !Number.isInteger(c.cantidad) || c.cantidad < 1)) return false;
    }
    return true;
  }, [form]);

  const isDirty = mode === 'create'
    ? form.nombre !== '' || form.categoriaId !== ''
    : !!existingItem && JSON.stringify(form) !== JSON.stringify(toFormState(existingItem));

  const handleBack = () => {
    if (isDirty) setShowDiscardModal(true);
    else navigate('/items');
  };

  const handleSave = () => {
    if (!isValid) return;
    const draft: ItemDraft = {
      codigo: form.codigo,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      referencia: form.referencia.trim(),
      categoriaId: form.categoriaId,
      unidadId: form.unidadId as UnidadId,
      impuestoId: form.impuestoId as ImpuestoId,
      precioBase: parseCOP(form.precioBaseRaw),
      precioTotal: parseCOP(form.precioTotalRaw),
      costo: parseCOP(form.costoRaw),
      manejaExistencias: form.manejaExistencias,
      sucursales: form.sucursalIds.map(sucursalId => ({
        sucursalId,
        existencia: form.manejaExistencias ? parseInt(form.existencias[sucursalId] ?? '0', 10) || 0 : 0,
      })),
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
          {mode === 'edit' ? 'Editar ítem' : 'Crear ítem'}
        </p>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button className="btn btn-cancel" onClick={handleBack}>Cancelar</button>
          <button className="btn btn-primary" disabled={!isValid} onClick={handleSave}>
            {mode === 'edit' ? 'Guardar cambios' : 'Crear ítem'}
          </button>
        </div>
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
              action={{ label: 'Agregar', onClick: () => toast.info('Agregar categoría — próximamente') }}
            />
            <TextAreaField label="Descripción" value={form.descripcion} onChange={v => set('descripcion', v)} placeholder="Escribe la descripción del ítem" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <TextField label="Código" value={form.codigo} onChange={v => set('codigo', v)} placeholder="Ingresa el código para el ítem" />
              <SelectField label="Unidad" required value={form.unidadId} onChange={v => set('unidadId', v as UnidadId)} options={unidadOptions} clearable placeholder="Selecciona una unidad" />
            </div>
            <TextField label="Referencia" value={form.referencia} onChange={v => set('referencia', v)} placeholder="Ingresa una referencia" helper="Aparece en el comprobante de venta" />
            <div style={{ borderTop: '1px solid var(--black-10)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Toggle checked={form.esCombo} onChange={v => set('esCombo', v)} ariaLabel="Es un combo" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--black-100)' }}>Es un combo</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--black-40)', margin: '6px 0 0' }}>
                Al activar, elige los productos existentes que lo componen abajo.
              </p>
            </div>
          </div>

          {form.esCombo && (
            <ComboComponentsCard
              componentes={form.componentes}
              onAdd={addComponente}
              onChangeCantidad={changeComponenteCantidad}
              onRemove={removeComponente}
              precioTotal={parseCOP(form.precioTotalRaw)}
              error={componentesError}
            />
          )}

          {/* Precio total de venta */}
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--black-100)', margin: 0 }}>Precio total de venta</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 12, alignItems: 'end' }}>
              <TextField label="Precio base" required type="number" value={form.precioBaseRaw} onChange={setPrecioBase} placeholder="0" />
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--black-40)', paddingBottom: 10 }}>+</span>
              <SelectField label="Impuesto" required value={form.impuestoId} onChange={setImpuesto} options={impuestoOptions} placeholder="Buscar..." />
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--black-40)', paddingBottom: 10 }}>=</span>
              <TextField label="Precio total de venta" required type="number" value={form.precioTotalRaw} onChange={setPrecioTotal} placeholder="0" />
            </div>
            <TextField label="Costo" type="number" value={form.costoRaw} onChange={v => set('costoRaw', v)} placeholder="0" helper="Ingresa el valor que te cuesta este ítem" />
            {form.precioTotalRaw && (
              <p style={{ fontSize: 12, color: 'var(--black-40)', margin: 0 }}>
                Precio de venta: {formatCOP(parseCOP(form.precioTotalRaw))}
              </p>
            )}
          </div>
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
              + Agregar imagen
            </button>
          </div>

          {/* Disponibilidad */}
          <DisponibilidadCard
            manejaExistencias={form.manejaExistencias}
            onToggleManeja={v => set('manejaExistencias', v)}
            sucursalIds={form.sucursalIds}
            onToggleSucursal={toggleSucursal}
            existencias={form.existencias}
            onChangeExistencia={setExistencia}
            unidadLabel={unidadLabel}
            sucursalesError={sucursalesError}
          />
        </div>
      </div>

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
