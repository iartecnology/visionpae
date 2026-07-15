'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

// Fix Leaflet default icon paths (broken with bundlers)
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const iconSmall = L.divIcon({
  className: 'rounded-full bg-emerald-600 border-2 border-white shadow-md',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export interface ProductorMapa {
  id: string;
  razonSocial: string;
  nombreComercial: string | null;
  latitud: number;
  longitud: number;
  calificacionPromedio: number;
  estado: string;
  codigoMunicipio: string;
  codigoDepartamento: string;
  productos: { id: string; nombre: string; categoria: string }[];
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function ExplorarMap({
  productores,
  center,
  zoom,
  onBoundsChange,
}: {
  productores: ProductorMapa[];
  center: [number, number];
  zoom: number;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  const markers = useMemo(
    () =>
      productores.map((p) => ({
        geocode: [p.latitud, p.longitud] as [number, number],
        popup: (
          <div className="min-w-[200px] text-sm">
            <p className="mb-1 font-semibold text-emerald-800">{p.razonSocial}</p>
            {p.nombreComercial && (
              <p className="mb-1 text-xs text-slate-500">✨ {p.nombreComercial}</p>
            )}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs">★ {Number(p.calificacionPromedio).toFixed(1)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  p.estado === 'activo'
                    ? 'bg-green-100 text-green-700'
                    : p.estado === 'en_acreditacion'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {p.estado.replace(/_/g, ' ')}
              </span>
            </div>
            {p.productos.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {p.productos.slice(0, 3).map((prod) => (
                  <span
                    key={prod.id}
                    className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600"
                  >
                    {prod.nombre}
                  </span>
                ))}
                {p.productos.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{p.productos.length - 3}</span>
                )}
              </div>
            )}
            <Link
              href={`/dashboard/rupl/${p.id}`}
              className="mt-1 block text-center rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Ver productor
            </Link>
          </div>
        ),
      })),
    [productores],
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker key={m.geocode.join(',')} position={m.geocode} icon={iconDefault}>
          <Popup>{m.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
