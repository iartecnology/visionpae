'use client';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Link from 'next/link';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface ProductorMapa {
  id: string;
  razonSocial: string;
  nombreComercial: string | null;
  latitud: number;
  longitud: number;
  calificacionPromedio: number;
  estado: string;
  tipoPersona?: string;
  estrato?: string;
  codigoMunicipio: string;
  codigoDepartamento: string;
  productos: { id: string; nombre: string; categoria: string; precioReferencia?: number; unidadMedida?: string }[];
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [map, center, zoom]);
  return null;
}

function MarkerClusterLayer({ productores }: { productores: ProductorMapa[] }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!clusterRef.current) {
      clusterRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) =>
          L.divIcon({
            html: `<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white shadow-lg ring-2 ring-white">${cluster.getChildCount()}</div>`,
            className: '',
            iconSize: L.point(40, 40),
          }),
      });
      map.addLayer(clusterRef.current);
    }

    const cluster = clusterRef.current;
    cluster.clearLayers();

    const markers = productores.map((p) => {
      const marker = L.marker([p.latitud, p.longitud], { icon: iconDefault });

      const popupDiv = document.createElement('div');
      const root = createRoot(popupDiv);
      root.render(
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
            className="mt-1 block rounded bg-emerald-600 px-3 py-1 text-center text-xs font-medium text-white hover:bg-emerald-700"
          >
            Ver productor
          </Link>
        </div>,
      );

      marker.bindPopup(popupDiv);
      return marker;
    });

    cluster.addLayers(markers);

    return () => {
      cluster.clearLayers();
      markers.forEach((m) => {
        const popup = m.getPopup();
        if (popup) m.unbindPopup();
      });
    };
  }, [map, productores]);

  return null;
}

export default function ExplorarMap({
  productores,
  center,
  zoom,
}: {
  productores: ProductorMapa[];
  center: [number, number];
  zoom: number;
}) {
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
      <MarkerClusterLayer productores={productores} />
    </MapContainer>
  );
}
