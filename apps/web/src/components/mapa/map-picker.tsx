'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  lat,
  lng,
  onChange,
  readOnly,
}: {
  lat?: number | null;
  lng?: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  const center: [number, number] =
    lat && lng ? [lat, lng] : [5.5, -73.5];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <MapContainer
        center={center}
        zoom={lat && lng ? 14 : 7}
        className="h-64 w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && (
          <ClickHandler
            onClick={(lat, lng) => onChange?.(lat, lng)}
          />
        )}
        {lat && lng && (
          <Marker position={[lat, lng]} icon={icon} />
        )}
      </MapContainer>
      {!readOnly && (
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <span>Haz clic en el mapa para ubicar al productor</span>
          {lat && lng && (
            <span className="ml-auto font-mono">
              {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
