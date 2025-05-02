'use client';

import { FC } from 'react';
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DefaultMarker from '../../../assets/marker-icon.png';
import DefaultMarkerShadow from '../../../assets/marker-shadow.png';
import { MapLeafletProps } from './Map.types';

const defaultIcon = L.icon({
  iconUrl: DefaultMarker.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: DefaultMarkerShadow.src,
  shadowSize: [41, 41],
});

const MapLeaflet: FC<MapLeafletProps> = ({
  center = [0, 0],
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
          key={'marker' + idx}
          position={[52.52, 13.405]}
          icon={defaultIcon}
        >
          {marker.popup.content && <Popup>{marker.popup.content}</Popup>}
        </Marker>
      ))}
    </LeafletMapContainer>
  );
};

export default MapLeaflet;
