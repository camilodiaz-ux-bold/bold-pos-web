/**
 * ConfirmDeleteModal — modal de confirmación de borrado, siguiendo el
 * patrón ya usado en GestionarMesasView.tsx (bg-black/40 backdrop-blur-sm
 * + card rounded-[var(--radius-20)] p-8 + btn-cancel / btn-danger).
 */
import React from 'react';

interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ title, message, confirmLabel = 'Eliminar', onCancel, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[var(--radius-20)] w-full max-w-xs mx-4 p-8">
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black-100)', margin: '0 0 8px' }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--black-60)', margin: '0 0 24px' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-cancel flex-1">Cancelar</button>
          <button onClick={onConfirm} className="btn btn-danger flex-1" style={{ backgroundColor: 'var(--coral-10)' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
