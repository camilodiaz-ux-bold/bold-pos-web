/**
 * CrearProveedorDrawer — "Nuevo contacto" desde el formulario de factura (specs/2026-10-facturas-compra.md §6).
 * Mismo formulario y validación que Proveedores (ContactoFormFields + validarContacto), en el panel lateral.
 */
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useContactos } from '../../store/contactosStore';
import type { Contacto, ContactoDraft } from '../../types/contacto';
import { emptyContactoDraft, normalizarContacto, validarContacto, type ContactoErrors } from '../../utils/contactos';
import { ContactoFormFields } from '../contactos/ContactoFormFields';
import { Drawer } from './Drawer';

interface Props { onClose: () => void; onCreated: (contacto: Contacto) => void }

export function CrearProveedorDrawer({ onClose, onCreated }: Props) {
  const { createContacto } = useContactos();
  const [form, setForm] = useState<ContactoDraft>(() => emptyContactoDraft('proveedor'));
  const [errors, setErrors] = useState<ContactoErrors>({});

  const set = <K extends keyof ContactoDraft>(key: K) => (value: ContactoDraft[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined, ...(key === 'esCliente' || key === 'esProveedor' ? { tipoContacto: undefined } : {}) }));
  };

  const guardar = () => {
    const e = validarContacto(form);
    setErrors(e);
    if (Object.keys(e).length > 0) { toast.error('Revisa los campos marcados'); return; }
    const contacto = createContacto(normalizarContacto(form));
    toast.success('Contacto creado');
    onCreated(contacto);
  };

  return (
    <Drawer
      title="Nuevo contacto" width={560} onClose={onClose}
      footer={(
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={guardar}>Guardar</button>
        </>
      )}
    >
      <ContactoFormFields form={form} set={set} errors={errors} plain />
    </Drawer>
  );
}
