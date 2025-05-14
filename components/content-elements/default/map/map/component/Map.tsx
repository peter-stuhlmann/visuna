'use client';

import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer } from './Map.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Button from '../../../button/button';
import DefaultMap from '../../../assets/map.png';
import Image from '../../../images/image';
import NoJsMessage from '../../../loading/no-js-message';
import { MapProps } from './Map.types';
import { getPrimaryColor } from '../../../constants';
import { allowMapTemporarily } from './utils/allowMapTemporarily';
import { isMapConsentGiven } from './utils/isMapConsentGiven';

// Dynamischer Import der Leaflet-Karte
const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => null,
});

const Map: FC<MapProps> = ({
  textColor = getPrimaryColor()['950'],
  map,
  placeholderImage,
}) => {
  const [showMap, setShowMap] = useState(false);
  const elementClassName = getElementClassName('map');

  useEffect(() => {
    if (isMapConsentGiven()) {
      setShowMap(true);
    }
  }, []);

  const handleEnableMap = () => {
    allowMapTemporarily();
    setShowMap(true);
  };

  return (
    <MapContainer className={elementClassName}>
      {!showMap ? (
        <>
          <Image
            src={placeholderImage?.src || DefaultMap}
            alt=""
            className={elementClassName + '-preview-image'}
          />
          <div className={elementClassName + '-overlay'}>
            <Button onClick={handleEnableMap} variant="contained">
              {map?.enableMapButtonText || 'Click to enable map'}
            </Button>
            <NoJsMessage
              hideElement={`.${elementClassName}-overlay`}
              textColor={textColor}
            >
              Bitte aktviere Javascript in Deinen Browsereinstellungen, um die
              Karte nutzen zu können.
            </NoJsMessage>
          </div>
        </>
      ) : (
        <MapLeaflet
          center={map?.center}
          zoom={map?.zoom}
          markers={map?.markers}
        />
      )}
    </MapContainer>
  );
};

export default Map;
