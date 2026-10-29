/**
 * CrearVarianteDrawer — panel lateral "Crear variante" / "Editar variante" del catálogo de tipos
 * (nombre + lista de opciones). Lo usan el formulario de ítem y, en la fase 3, el módulo Variantes de
 * inventario (specs/2026-10-variantes-modelo.md §2 y §4).
 */
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { VarianteTipo } from '../../../types/item';
import { useVariantesCatalogo } from '../../../store/variantesStore';
import { Drawer } from '../../../components/compras/Drawer';
import { FieldLabel } from '../../../components/items/FormField';

interface Props {
  /** Presente al editar un tipo existente. */
  tipo?: VarianteTipo;
  onClose: () => void;
  onSave: (draft: { nombre: string; opciones: string[] }) => void;
}

const norm = (s: string) => s.trim().toLowerCase();

export function CrearVarianteDrawer({ tipo, onClose, onSave }: Props) {
  const { tipos } = useVariantesCatalogo();
  const [nombre, setNombre] = useState(tipo?.nombre ?? '');
  const [opciones, setOpciones] = useState<string[]>(tipo?.opciones.length ? tipo.opciones : ['']);

  const llenas = opciones.map(o => o.trim()).filter(Boolean);
  const nombreRepetido = tipos.some(t => t.id !== tipo?.id && norm(t.nombre) === norm(nombre));
  const opcionRepetida = new Set(llenas.map(norm)).size !== llenas.length;
  const nombreError = nombre.trim() && nombreRepetido ? 'Ya existe una variante con ese nombre' : undefined;
  const opcionesError = opcionRepetida ? 'Las opciones no pueden repetirse' : undefined;
  const canSave = nombre.trim().length > 0 && !nombreRepetido && llenas.length > 0 && !opcionRepetida;

  const setOpcion = (i: number, v: string) => setOpciones(prev => prev.map((o, j) => (j === i ? v : o)));

  return (
    <Drawer
      title={tipo ? 'Editar variante' : 'Crear variante'}
      width={560}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            type="button" className="btn btn-primary" disabled={!canSave}
            onClick={() => onSave({ nombre: nombre.trim(), opciones: llenas })}
          >
            Guardar
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <FieldLabel required>Nombre de la variante</FieldLabel>
          <input
            value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingresa el nombre de la variante"
            className="merlin-input-filled" style={nombreError ? { borderColor: 'var(--coral-100)' } : undefined}
          />
          {nombreError && <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: '4px 0 0' }}>{nombreError}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--black-100)' }}>Variantes</span>
          <button
            type="button" aria-label="Agregar opción" onClick={() => setOpciones(prev => [...prev, ''])}
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', backgroundColor: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Plus size={16} color="var(--black-0)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {opciones.map((o, i) => (
            <div key={i}>
              <FieldLabel required={i === 0}>Variante {i + 1}</FieldLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  value={o} onChange={e => setOpcion(i, e.target.value)} placeholder="Ingresa el nombre de la variante"
                  className="merlin-input-filled"
                />
                {opciones.length > 1 && (
                  <button
                    type="button" aria-label={`Quitar variante ${i + 1}`} onClick={() => setOpciones(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}
                  >
                    <Trash2 size={16} color="var(--black-60)" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {opcionesError && <p style={{ fontSize: 12, color: 'var(--coral-100)', margin: 0 }}>{opcionesError}</p>}
        </div>
      </div>
    </Drawer>
  );
}
