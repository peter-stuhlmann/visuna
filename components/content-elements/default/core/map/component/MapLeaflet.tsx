'use client';

import { FC } from 'react';
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  Marker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { MapLeafletProps } from './Map.types';

import DefaultMarker from './assets/marker-icon.png';
import DefaultMarkerShadow from './assets/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: DefaultMarker.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: DefaultMarkerShadow.src,
  shadowSize: [41, 41],
});

const MapLeaflet: FC<MapLeafletProps> = ({
  center = { lat: 0, lng: 0 },
  zoom = 10,
  markers = [],
}) => {
  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker, idx: number) => (
        <Marker
          key={idx}
          position={[marker.lat, marker.lng]}
          icon={defaultIcon}
        ></Marker>
      ))}
    </LeafletMapContainer>
  );
};

export default MapLeaflet;
