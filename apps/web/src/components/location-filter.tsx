'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Departamento { codigo: string; nombre: string }
interface Municipio { codigo: string; nombre: string }
interface Vereda { codigo: string; nombre: string }

export function LocationFilter({ value, onChange }: {
  value: { departamento?: string; municipio?: string; vereda?: string };
  onChange: (v: { departamento?: string; municipio?: string; vereda?: string }) => void;
}) {
  const [deps, setDeps] = useState<Departamento[]>([]);
  const [muns, setMuns] = useState<Municipio[]>([]);
  const [veredas, setVeredas] = useState<Vereda[]>([]);

  useEffect(() => { api.get<Departamento[]>('/ubicacion/departamentos').then(setDeps).catch(() => {}); }, []);

  useEffect(() => {
    if (!value.departamento) { setMuns([]); return; }
    api.get<Municipio[]>(`/ubicacion/departamentos/${value.departamento}/municipios`).then(setMuns).catch(() => setMuns([]));
  }, [value.departamento]);

  useEffect(() => {
    if (!value.municipio) { setVeredas([]); return; }
    api.get<Vereda[]>(`/ubicacion/municipios/${value.municipio}/veredas`).then(setVeredas).catch(() => setVeredas([]));
  }, [value.municipio]);

  return (
    <div className="flex gap-2">
      <select
        value={value.departamento || ''}
        onChange={(e) => onChange({ departamento: e.target.value || undefined })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
      >
        <option value="">Departamento</option>
        {deps.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
      </select>
      <select
        value={value.municipio || ''}
        onChange={(e) => onChange({ ...value, municipio: e.target.value || undefined })}
        disabled={!value.departamento}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-40"
      >
        <option value="">Municipio</option>
        {muns.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
      </select>
      <select
        value={value.vereda || ''}
        onChange={(e) => onChange({ ...value, vereda: e.target.value || undefined })}
        disabled={!value.municipio}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-40"
      >
        <option value="">Vereda</option>
        {veredas.map((v) => <option key={v.codigo} value={v.codigo}>{v.nombre}</option>)}
      </select>
    </div>
  );
}
