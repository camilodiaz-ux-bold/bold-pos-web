/**
 * CrearItemDrawer — "Crear ítem" desde el formulario de factura (specs/2026-10-facturas-compra.md §6).
 * Crea un ítem inventariable en itemsStore; Precio total de venta = Precio base + impuesto (solo lectura).
 */
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useItems } from '../../store/itemsStore';
import { useCatalog } from '../../vertical';
import type { Item, ImpuestoId, UnidadId } from '../../types/item';
import { FieldLabel, SelectField, TextAreaField, TextField } from '../items/FormField';
import { formatCOP, parseCOP } from '../../utils/format';
import { Drawer } from './Drawer';

interface Props { onClose: () => void; onCreated: (item: Item) => void }

export function CrearItemDrawer({ onClose, onCreated }: Props) {
  const { createItem } = useItems();
  const { catDefs, unidades, impuestos } = useCatalog();
  const [f, setF] = useState({
    nombre: '', categoriaId: '', descripcion: '', codigo: '', unidadId: '' as UnidadId | '', referencia: '',
    precioBase: '', impuestoId: '' as ImpuestoId | '',
  });
  const [errors, setErrors] = useState<Partial<Record<'nombre' | 'categoriaId' | 'unidadId' | 'precioBase' | 'impuestoId', string>>>({});

  const set = <K extends keyof typeof f>(key: K) => (value: (typeof f)[K]) => {
    setF(prev => ({ ...prev, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };

  const base = parseCOP(f.precioBase);
  const rate = impuestos.find(i => i.id === f.impuestoId)?.rate ?? 0;
  const total = Math.round(base * (1 + rate));
  const categorias = useMemo(() => catDefs.map(c => ({ value: c.id, label: c.name })), [catDefs]);

  const guardar = () => {
    const req = 'Campo obligatorio';
    const e: typeof errors = {};
    if (!f.nombre.trim()) e.nombre = req;
    if (!f.categoriaId) e.categoriaId = req;
    if (!f.unidadId) e.unidadId = req;
    if (base <= 0) e.precioBase = req;
    if (!f.impuestoId) e.impuestoId = req;
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const item = createItem({
      codigo: f.codigo.trim(), nombre: f.nombre.trim(), descripcion: f.descripcion.trim(), referencia: f.referencia.trim(),
      categoriaId: f.categoriaId, unidadId: f.unidadId as UnidadId, impuestoId: f.impuestoId as ImpuestoId,
      precioBase: base, precioTotal: total, costo: 0, manejaExistencias: true,
      sucursales: [{ sucursalId: 'principal', existencia: 0 }], activo: true, esCombo: false,
    });
    toast.success('Ítem creado');
    onCreated(item);
  };

  const row = (cols: string, children: React.ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, marginBottom: 16, alignItems: 'start' }}>{children}</div>
  );

  return (
    <Drawer
      title="Crear ítem" width={720} onClose={onClose}
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={guardar}>Guardar</button>
        </>
      )}
    >
      <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--black-100)', margin: '0 0 12px' }}>Información general</p>
      <div style={{ marginBottom: 16 }}>
        <TextField label="Nombre del ítem" required value={f.nombre} onChange={set('nombre')} placeholder="Ingresa el nombre del ítem" error={errors.nombre} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <SelectField label="Categoría" required value={f.categoriaId} onChange={set('categoriaId')} options={categorias} placeholder="Buscar..." error={errors.categoriaId} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <TextAreaField label="Descripción" value={f.descripcion} onChange={set('descripcion')} placeholder="Escribe la descripción del ítem" rows={3} />
      </div>
      {row('1fr 1fr', (
        <>
          <TextField label="Código" value={f.codigo} onChange={set('codigo')} placeholder="Ingresa el código para el ítem" />
          <SelectField label="Unidad" required value={f.unidadId} onChange={v => set('unidadId')(v as UnidadId)}
            options={unidades.map(u => ({ value: u.id, label: u.label }))} placeholder="Buscar..." error={errors.unidadId} />
        </>
      ))}
      <div style={{ marginBottom: 24 }}>
        <TextField label="Referencia" value={f.referencia} onChange={set('referencia')} placeholder="Ingresa una referencia" helper="Aparece en el comprobante de venta" />
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: 'var(--black-100)', margin: '0 0 12px' }}>Precio total de venta</p>
      {row('1fr auto 1fr auto 1fr', (
        <>
          <TextField label="Precio base" required value={f.precioBase} onChange={set('precioBase')} placeholder="0" error={errors.precioBase} />
          <span style={{ paddingTop: 36, fontWeight: 700, color: 'var(--black-60)' }}>+</span>
          <SelectField label="Impuesto" required value={f.impuestoId} onChange={v => set('impuestoId')(v as ImpuestoId)}
            options={impuestos.map(i => ({ value: i.id, label: i.label }))} placeholder="Buscar..." error={errors.impuestoId} />
          <span style={{ paddingTop: 36, fontWeight: 700, color: 'var(--black-60)' }}>=</span>
          <div>
            <FieldLabel required>Precio total de venta</FieldLabel>
            <input className="merlin-input-filled" readOnly value={formatCOP(total)} style={{ color: 'var(--black-60)' }} />
          </div>
        </>
      ))}
      <div style={{ maxWidth: 220 }}>
        <FieldLabel>Costo</FieldLabel>
        <input className="merlin-input-filled" disabled value="$0" style={{ color: 'var(--black-60)' }} />
      </div>
    </Drawer>
  );
}
