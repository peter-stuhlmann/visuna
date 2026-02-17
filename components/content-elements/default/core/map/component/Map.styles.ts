'use client';

import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

export const MapContainer = styled.div`
  position: relative;
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  height: 450px;
  border-radius: 1rem;
  overflow: hidden;

  .${mergedConfig.classPrefix}-map-preview-image {
    img {
      object-fit: cover;
    }
  }

  .${mergedConfig.classPrefix}-map-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .leaflet-popup {
    max-width: 260px;

    .leaflet-popup-content {
      margin: 1rem;
    }

    .leaflet-popup-close-button {
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 1000px;
      transition: 0.2s ease-in-out;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }

      span {
        color: #000;
      }
    }
  }
`;
