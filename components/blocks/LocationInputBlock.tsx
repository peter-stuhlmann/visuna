'use client';

import { FC, useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BlockWrapper } from './BlockWrapper.styles';
import { FiTrash2 } from 'react-icons/fi';
import L from 'leaflet';
import DefaultMarker from '@/components/content-elements/default/assets/marker-icon.png';
import DefaultMarkerShadow from '@/components/content-elements/default/assets/marker-shadow.png';
import { Button, TextInput } from '../content-elements/default';

type LatLng = { lat: number; lng: number };

type LocationInputProps = {
  value?: LatLng;
  onChange: (coords: LatLng) => void;
  label?: string;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  markers?: LatLng[];
  onMarkersChange?: (markers: LatLng[]) => void;
};

const ZoomSync: FC<{ zoom: number }> = ({ zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  return null;
};

const ZoomListener: FC<{ onZoomChange: (zoom: number) => void }> = ({
  onZoomChange,
}) => {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
};

const CenterListener: FC<{
  currentCenter: LatLng;
  onCenterChange: (center: LatLng) => void;
}> = ({ currentCenter, onCenterChange }) => {
  const map = useMap();
  const lastCenter = useRef<LatLng>(currentCenter);

  useEffect(() => {
    const handler = () => {
      const c = map.getCenter();
      const newCenter = {
        lat: +c.lat.toFixed(6),
        lng: +c.lng.toFixed(6),
      };

      // Nur ändern, wenn wirklich anders
      if (
        newCenter.lat !== lastCenter.current.lat ||
        newCenter.lng !== lastCenter.current.lng
      ) {
        lastCenter.current = newCenter;
        onCenterChange(newCenter);
      }
    };

    map.on('moveend', handler);
    return () => {
      map.off('moveend', handler);
    };
  }, [map, onCenterChange]);

  return null;
};

const MarkerSetter: FC<{ onAdd: (coord: LatLng) => void }> = ({ onAdd }) => {
  useMapEvents({
    click(e) {
      onAdd({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const LocationInput: FC<LocationInputProps> = ({
  value,
  onChange,
  label,
  zoom = 10,
  onZoomChange,
  markers = [],
  onMarkersChange = () => {},
}) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const defaultCenter = useRef<LatLng>({ lat: 52.52, lng: 13.405 });
  const center = value ?? defaultCenter.current;

  const [localMarkers, setLocalMarkers] = useState<LatLng[]>(markers);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setLocalMarkers(markers);
  }, [markers]);

  const updateMarkers = (updated: LatLng[]) => {
    setLocalMarkers(updated);
    onMarkersChange(updated);
  };

  const handleAddMarker = (coord: LatLng) => {
    updateMarkers([...localMarkers, coord]);
  };

  const updateMarker = (index: number, coord: LatLng) => {
    const updated = [...localMarkers];
    updated[index] = coord;
    updateMarkers(updated);
  };

  const removeMarker = (index: number) => {
    const updated = [...localMarkers];
    updated.splice(index, 1);
    updateMarkers(updated);
  };

  const defaultIcon = L.icon({
    iconUrl: DefaultMarker.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: DefaultMarkerShadow.src,
    shadowSize: [41, 41],
  });

  return (
    <BlockWrapper>
      {label && <div style={{ marginBottom: '0.5rem' }}>{label}</div>}
      {isClient ? (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                height: '300px',
                width: '100%',
                marginBottom: '1rem',
                borderRadius: '1rem',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <MapContainer
                center={L.latLng(center.lat, center.lng)}
                zoom={zoom}
                scrollWheelZoom
                style={{ height: '100%', width: '100%' }}
              >
                <ZoomSync zoom={zoom} />
                {onZoomChange && <ZoomListener onZoomChange={onZoomChange} />}
                <CenterListener
                  currentCenter={center}
                  onCenterChange={onChange}
                />
                <MarkerSetter onAdd={handleAddMarker} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {localMarkers.map((m, i) => (
                  <Marker
                    key={i}
                    icon={defaultIcon}
                    position={L.latLng(m.lat, m.lng)}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const newPos = e.target.getLatLng();
                        updateMarker(i, { lat: newPos.lat, lng: newPos.lng });
                      },
                    }}
                  />
                ))}
              </MapContainer>
            </div>

            <div className="multi-input-container">
              {localMarkers.map((marker, i) => (
                <li key={i} className="multi-input-row">
                  <TextInput
                    label={`Marker ${i + 1} Latitude`}
                    type="number"
                    value={String(marker.lat)}
                    onChange={(value) =>
                      updateMarker(i, {
                        ...marker,
                        lat: parseFloat(value),
                      })
                    }
                  />
                  <TextInput
                    label={`Marker ${i + 1} Longitude`}
                    type="number"
                    value={String(marker.lng)}
                    onChange={(value) =>
                      updateMarker(i, {
                        ...marker,
                        lng: parseFloat(value),
                      })
                    }
                  />
                  <Button onClick={() => removeMarker(i)}>
                    <FiTrash2 size={18} />
                  </Button>
                </li>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ color: 'gray' }}>Kartenkomponente wird geladen...</div>
      )}
    </BlockWrapper>
  );
};

export default LocationInput;
