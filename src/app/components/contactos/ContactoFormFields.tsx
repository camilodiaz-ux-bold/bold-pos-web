/**
 * ContactoFormFields — las 4 secciones del formulario de contacto (specs/2026-10-proveedores.md §6).
 * Las usan la página Nuevo/Editar contacto (cada sección en su card) y el drawer "Crear proveedor"
 * del formulario de factura de compra (`plain`: secciones sin card, en el panel lateral).
 */
import React, { useMemo } from 'react';
import type { ContactoDraft, TipoDocumento, TipoPersona } from '../../types/contacto';
import {
  CIUDAD_OPCIONES, DESCUENTO_OPCIONES, PAIS_OPCIONES, REGIMEN_FISCAL_OPCIONES,
  RESPONSABILIDAD_FISCAL_OPCIONES, TIPO_DOCUMENTO_OPCIONES, TIPO_PERSONA_OPCIONES, VENDEDOR_OPCIONES,
} from '../../data/contactosSeed';
import { calcularDV, type ContactoErrors } from '../../utils/contactos';
import { FieldLabel, SelectField, TextAreaField, TextField } from '../items/FormField';
import { Toggle } from '../items/Toggle';
import { sectionCard, sectionTitle } from '../ventas/ventasStyles';

const grid = (columns: string): React.CSSProperties => ({
  display: 'grid', gridTemplateColumns: columns, gap: 16, marginBottom: 16,
});

interface Props {
  form: ContactoDraft;
  set: <K extends keyof ContactoDraft>(key: K) => (value: ContactoDraft[K]) => void;
  errors: ContactoErrors;
  /** Muestra el toggle Activo (solo al editar). */
  showActivo?: boolean;
  plain?: boolean;
}

export function ContactoFormFields({ form, set, errors, showActivo, plain }: Props) {
  const dv = useMemo(
    () => (form.tipoDocumento === 'nit' ? calcularDV(form.numeroDocumento) : ''),
    [form.tipoDocumento, form.numeroDocumento],
  );

  const checkbox = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 500, color: 'var(--black-100)',
    }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: 'var(--blue-100)' }} />
      {label}
    </label>
  );

  const section = (title: string, children: React.ReactNode) => plain ? (
    <div style={{ marginBottom: 24 }}>
      <p style={{ ...sectionTitle, margin: '0 0 12px' }}>{title}</p>
      {children}
    </div>
  ) : (
    <div style={sectionCard}>
      <p style={sectionTitle}>{title}</p>
      {children}
    </div>
  );

  const two = plain ? '1fr 1fr' : '1fr 1fr';

  return (
    <>
      {section('1. Nombre y tipo de contacto', (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: plain ? 200 : 280 }}>
            <TextField label="Nombre y apellidos / Razón social" required value={form.nombre}
              onChange={set('nombre')} placeholder="Ingresa el nombre" error={errors.nombre} />
          </div>
          <div style={{ flex: 1, minWidth: plain ? 200 : 220 }}>
            <FieldLabel required>Tipo de contacto</FieldLabel>
            <div style={{ display: 'flex', gap: 20, padding: '10px 0' }}>
              {checkbox('Cliente', form.esCliente, set('esCliente'))}
              {checkbox('Proveedor', form.esProveedor, set('esProveedor'))}
            </div>
            {errors.tipoContacto && (
              <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: 0 }}>{errors.tipoContacto}</p>
            )}
          </div>
          {showActivo && (
            <div>
              <FieldLabel>Activo</FieldLabel>
              <div style={{ padding: '8px 0' }}>
                <Toggle checked={form.activo} onChange={set('activo')} ariaLabel="Activo" />
              </div>
            </div>
          )}
        </div>
      ))}

      {section('2. Datos básicos', (
        <>
          <div style={grid(two)}>
            <TextField label="Correo electrónico" required value={form.correo} onChange={set('correo')}
              placeholder="Ejemplo: nombre@gmail.com" error={errors.correo} />
            <TextField label="Número de celular" value={form.celular} onChange={set('celular')}
              placeholder="Ejemplo: 3123456789" />
          </div>
          <div style={grid(two)}>
            <TextField label="Teléfono 1" value={form.telefono1} onChange={set('telefono1')} placeholder="#" />
            <TextField label="Teléfono 2" value={form.telefono2} onChange={set('telefono2')} placeholder="#" />
          </div>
          <TextAreaField label="Observaciones" value={form.observaciones} onChange={set('observaciones')}
            placeholder="Agrega notas u observaciones adicionales." />
        </>
      ))}

      {section('3. Datos fiscales y comerciales', (
        <>
          <div style={grid(two)}>
            <SelectField label="Tipo de persona" required value={form.tipoPersona}
              onChange={v => set('tipoPersona')(v as TipoPersona)} options={TIPO_PERSONA_OPCIONES}
              placeholder="Buscar..." error={errors.tipoPersona} />
            <SelectField label="Tipo de documento" required value={form.tipoDocumento}
              onChange={v => set('tipoDocumento')(v as TipoDocumento)} options={TIPO_DOCUMENTO_OPCIONES}
              placeholder="Buscar..." error={errors.tipoDocumento} />
          </div>
          <div style={grid(plain ? '2fr 1fr' : '2fr 1fr 2fr')}>
            <TextField label="Número de documento / NIT" required value={form.numeroDocumento}
              onChange={set('numeroDocumento')} placeholder="Ingresa el número de identificación"
              error={errors.numeroDocumento} />
            <TextField label="DV" value={dv} onChange={() => undefined} disabled />
            {!plain && (
              <SelectField label="Responsabilidad fiscal" value={form.responsabilidadFiscal}
                onChange={set('responsabilidadFiscal')} options={RESPONSABILIDAD_FISCAL_OPCIONES}
                placeholder="Buscar..." clearable />
            )}
          </div>
          {plain && (
            <div style={grid(two)}>
              <SelectField label="Responsabilidad fiscal" value={form.responsabilidadFiscal}
                onChange={set('responsabilidadFiscal')} options={RESPONSABILIDAD_FISCAL_OPCIONES}
                placeholder="Buscar..." clearable />
            </div>
          )}
          <div style={grid(two)}>
            <SelectField label="Régimen fiscal" value={form.regimenFiscal} onChange={set('regimenFiscal')}
              options={REGIMEN_FISCAL_OPCIONES} placeholder="Buscar..." clearable />
            <SelectField label="Vendedor" value={form.vendedor} onChange={set('vendedor')}
              options={VENDEDOR_OPCIONES} placeholder="Buscar..." clearable />
          </div>
          <div style={grid(two)}>
            <SelectField label="Descuento" value={form.descuento} onChange={set('descuento')}
              options={DESCUENTO_OPCIONES} placeholder="Buscar..." clearable />
          </div>
        </>
      ))}

      {section('4. Datos de ubicación', (
        <>
          <div style={grid(two)}>
            <SelectField label="País" value={form.pais} onChange={set('pais')} options={PAIS_OPCIONES} />
            <SelectField label="Departamento / Ciudad" value={form.ciudad} onChange={set('ciudad')}
              options={CIUDAD_OPCIONES} placeholder="Buscar..." clearable />
          </div>
          <TextAreaField label="Dirección" value={form.direccion} onChange={set('direccion')}
            placeholder="Ingresa la dirección" />
        </>
      ))}
    </>
  );
}
