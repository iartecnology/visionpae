'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={`inline-flex items-center gap-0.5 ${sizeMap[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer'
          } ${star <= display ? 'text-amber-400' : 'text-slate-200'}`}
        >
          ★
        </button>
      ))}
      {!readonly && value > 0 && (
        <button
          type="button"
          onClick={() => onChange?.(0)}
          className="ml-2 text-xs text-slate-400 hover:text-red-500"
        >
          ✕
        </button>
      )}
    </div>
  );
}
