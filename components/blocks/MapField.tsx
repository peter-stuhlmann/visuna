'use client';

import { FC, useCallback, useMemo } from 'react';
import SliderInput from './SliderInput';
import dynamic from 'next/dynamic';

const LocationInput = dynamic(() => import('./LocationInput'), {
  ssr: false,
});

type LatLng = { lat: number; lng: number };

export type MapValue = {
  zoom: number;
  center: LatLng;
  markers: LatLng[];
};

const DEFAULT_VALUE: MapValue = {
  zoom: 10,
  center: { lat: 52.52, lng: 13.405 },
  markers: [],
};

const MapField: FC<{
  value?: MapValue; // optional, falls du es mal ohne initial übergibst
  onChange: (v: MapValue) => void;
}> = ({ value, onChange }) => {
  // Stabilisieren, damit useCallback-Dependencies nicht auf jedem Render wechseln
  const safeValue = useMemo<MapValue>(() => value ?? DEFAULT_VALUE, [value]);

  const handleCenterChange = useCallback(
    (newCenter: LatLng) => {
      if (
        newCenter.lat !== safeValue.center.lat ||
        newCenter.lng !== safeValue.center.lng
      ) {
        onChange({ ...safeValue, center: newCenter });
      }
    },
    [safeValue, onChange]
  );

  const handleZoomChange = useCallback(
    (newZoom: number) => {
      if (newZoom !== safeValue.zoom) {
        onChange({ ...safeValue, zoom: newZoom });
      }
    },
    [safeValue, onChange]
  );

  const handleMarkersChange = useCallback(
    (markers: LatLng[]) => {
      // Nur feuern, wenn sich wirklich was geändert hat (optional)
      // if (markers !== safeValue.markers) {
      onChange({ ...safeValue, markers });
      // }
    },
    [safeValue, onChange]
  );

  return (
    <>
      <SliderInput
        label="Zoomstufe"
        start={0}
        end={18}
        steps={1}
        value={safeValue.zoom}
        onChange={handleZoomChange}
      />

      <LocationInput
        label="Kartenmittelpunkt"
        value={safeValue.center}
        onChange={handleCenterChange}
        zoom={safeValue.zoom}
        onZoomChange={handleZoomChange}
        markers={safeValue.markers}
        onMarkersChange={handleMarkersChange}
      />
    </>
  );
};

export default MapField;
