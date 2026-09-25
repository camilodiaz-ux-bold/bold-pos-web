/**
 * ItemThumb — thumbnail 40×40 (o el tamaño que se le pida) con fallback
 * cuando el ítem no tiene imagen. Reutiliza ImageWithFallback existente.
 */
import React from 'react';
import { ImageIcon } from 'lucide-react';

interface ItemThumbProps {
  src?: string;
  alt: string;
  size?: number;
  radius?: number;
}

export function ItemThumb({ src, alt, size = 40, radius = 8 }: ItemThumbProps) {
  if (!src) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius,
        backgroundColor: 'var(--blue-10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ImageIcon size={size * 0.45} color="var(--blue-40)" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{
        width: size, height: size, borderRadius: radius,
        objectFit: 'cover', flexShrink: 0, backgroundColor: 'var(--blue-10)',
      }}
      onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
    />
  );
}
