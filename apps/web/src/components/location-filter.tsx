'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Pais { codigo: string; nombre: string }
interface Departamento { codigo: string; nombre: string }
interface Municipio { codigo: string; nombre: string }

export function LocationFilter({ value, onChange, compact }: {
  value: { pais?: string; departamento?: string; municipio?: string };
  onChange: (v: { pais?: string; departamento?: string; municipio?: string }) => void;
  compact?: boolean;
}) {
  const [paises, setPaises] = useState<Pais[]>([]);
  const [deps, setDeps] = useState<Departamento[]>([]);
  const [muns, setMuns] = useState<Municipio[]>([]);

  useEffect(() => { api.get<Pais[]>('/ubicacion/paises').then(setPaises).catch(() => {}); }, []);

  useEffect(() => {
    if (!value.pais) { setDeps([]); return; }
    api.get<Departamento[]>(`/ubicacion/departamentos?pais=${value.pais}`).then(setDeps).catch(() => setDeps([]));
  }, [value.pais]);

  useEffect(() => {
    if (!value.departamento) { setMuns([]); return; }
    api.get<Municipio[]>(`/ubicacion/departamentos/${value.departamento}/municipios`).then(setMuns).catch(() => setMuns([]));
  }, [value.departamento]);

  return (
    <div className={cn('flex gap-2', compact ? 'flex-col' : '')}>
      <select
        value={value.pais || ''}
        onChange={(e) => onChange({ pais: e.target.value || undefined })}
        className={cn('rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary', compact && 'w-full')}
      >
        <option value="">País</option>
        {paises.map((p) => <option key={p.codigo} value={p.codigo}>{p.nombre}</option>)}
      </select>
      <select
        value={value.departamento || ''}
        onChange={(e) => onChange({ ...value, departamento: e.target.value || undefined, municipio: undefined })}
        disabled={!value.pais}
        className={cn('rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-40', compact && 'w-full')}
      >
        <option value="">Departamento</option>
        {deps.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
      </select>
      <select
        value={value.municipio || ''}
        onChange={(e) => onChange({ ...value, municipio: e.target.value || undefined })}
        disabled={!value.departamento}
        className={cn('rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-40', compact && 'w-full')}
      >
        <option value="">Municipio</option>
        {muns.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
      </select>
    </div>
  );
}