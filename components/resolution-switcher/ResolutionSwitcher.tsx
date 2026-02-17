'use client';

import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { MdScreenRotation, MdFitScreen } from 'react-icons/md';
import { useClientStorage } from '../content-elements/default/utils/useLocalStorage';

/* ─── Types ────────────────────────────────────────────────────────── */

export type ResolutionPreset = 'free' | 'phone' | 'tablet' | 'fhd' | '4k';
export type Orientation = 'portrait' | 'landscape';

export type ResolutionConfig = {
  preset: ResolutionPreset;
  orientation: Orientation;
  width: number;
  height: number;
  label: string;
  zoom: number;       // percentage, e.g. 100 = 100%
  zoomMode: ZoomMode;
};

export type ZoomMode = 'fixed' | 'fit' | 'custom';

const PRESETS: Record<ResolutionPreset, { w: number; h: number; label: string }> = {
  free:   { w: 0,    h: 0,    label: 'Frei' },
  phone:  { w: 375,  h: 667,  label: 'Phone' },
  tablet: { w: 1024, h: 1366, label: 'Tablet' },
  fhd:    { w: 1920, h: 1080, label: 'Full HD' },
  '4k':   { w: 3840, h: 2160, label: '4K' },
};

const PRESET_KEYS: ResolutionPreset[] = ['free', 'phone', 'tablet', 'fhd', '4k'];
const BUTTON_LABELS: Record<ResolutionPreset, string> = {
  free:   'Frei',
  phone:  'Phone',
  tablet: 'Tablet',
  fhd:    'FHD',
  '4k':   '4K',
};

const ZOOM_OPTIONS = [25, 50, 75, 100, 125, 150, 175, 200];

export function getResolution(
  preset: ResolutionPreset,
  orientation: Orientation,
  zoom: number = 100,
  zoomMode: ZoomMode = 'fixed'
): ResolutionConfig {
  const p = PRESETS[preset];
  if (preset === 'free') return { preset, orientation, width: 0, height: 0, label: 'Frei', zoom, zoomMode };
  const isLandscape = orientation === 'landscape';
  const w = isLandscape ? Math.max(p.w, p.h) : Math.min(p.w, p.h);
  const h = isLandscape ? Math.min(p.w, p.h) : Math.max(p.w, p.h);
  const orientLabel = isLandscape ? 'Landscape' : 'Portrait';
  return { preset, orientation, width: w, height: h, label: `${p.label} – ${w}×${h} (${orientLabel})`, zoom, zoomMode };
}

/* ─── Styled Components ────────────────────────────────────────────── */

const SwitcherRow = styled.div`
  position: relative;
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  border-radius: 8px;
  background: #f0f0f0;
`;

const Slider = styled.div<{ $left: number; $width: number; $animate: boolean }>`
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => $width}px;
  border-radius: 6px;
  background: #3b82f6;
  transition: ${({ $animate }) =>
    $animate
      ? 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none'};
  pointer-events: none;
  z-index: 0;
`;

const PresetBtn = styled.button<{ $active: boolean }>`
  height: 30px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  box-sizing: border-box;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  color: ${({ $active }) => ($active ? '#fff' : '#555')};
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ $active }) => ($active ? '#fff' : '#111')};
  }
`;

const OrientBtn = styled.button<{ $active: boolean }>`
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 6px;
  border: none;
  background: ${({ $active }) => ($active ? '#3b82f6' : '#f0f0f0')};
  color: ${({ $active }) => ($active ? '#fff' : '#555')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ $active }) => ($active ? '#fff' : '#111')};
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
`;

const ZoomSelect = styled.select`
  height: 30px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: #f0f0f0;
  color: #555;
  cursor: pointer;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const ZoomInput = styled.input`
  width: 52px;
  height: 30px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #333;
  text-align: center;
  outline: none;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

/* ─── Component ────────────────────────────────────────────────────── */

type Props = {
  onResolutionChange?: (config: ResolutionConfig) => void;
};

const ResolutionSwitcher: FC<Props> = ({ onResolutionChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [pos, setPos] = useState({ left: 0, width: 0 });
  const [animate, setAnimate] = useState(false);
  const initRef = useRef(false);

  const [preset, setPreset] = useClientStorage<ResolutionPreset>('resolution-preset', 'free', 'cookie');
  const [orientation, setOrientation] = useClientStorage<Orientation>('resolution-orientation', 'portrait', 'cookie');
  const [zoomMode, setZoomMode] = useClientStorage<ZoomMode>('resolution-zoom-mode', 'fixed', 'cookie');
  const [zoomValue, setZoomValue] = useClientStorage<number>('resolution-zoom', 100, 'cookie');
  const [customZoomInput, setCustomZoomInput] = useState(String(zoomValue));

  const setRef = useCallback(
    (key: string, el: HTMLButtonElement | null) => {
      if (el) btnRefs.current.set(key, el);
      else btnRefs.current.delete(key);
    },
    []
  );

  // Measure and update indicator position
  useEffect(() => {
    const container = containerRef.current;
    const btn = btnRefs.current.get(preset as string);
    if (!container || !btn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const newLeft = bRect.left - cRect.left;
    const newWidth = bRect.width;

    if (!initRef.current) {
      setPos({ left: newLeft, width: newWidth });
      requestAnimationFrame(() => {
        initRef.current = true;
        setAnimate(true);
      });
    } else {
      setPos({ left: newLeft, width: newWidth });
    }
  }, [preset]);

  // Broadcast resolution change
  const broadcastChange = useCallback((p: ResolutionPreset, o: Orientation, z: number, zm: ZoomMode) => {
    const config = getResolution(p, o, z, zm);
    window.dispatchEvent(
      new CustomEvent('preview-resolution-change', { detail: config })
    );
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'resolution-change', ...config });
    channel.close();
    onResolutionChange?.(config);
  }, [onResolutionChange]);

  // Broadcast whenever cookie values load/change
  useEffect(() => {
    broadcastChange(
      preset as ResolutionPreset,
      orientation as Orientation,
      zoomValue as number,
      zoomMode as ZoomMode
    );
  }, [preset, orientation, zoomValue, zoomMode]);

  const handlePresetClick = (p: ResolutionPreset) => {
    setPreset(p);
    // Phone defaults to portrait, all others to landscape
    const defaultOrientation: Orientation = p === 'phone' ? 'portrait' : 'landscape';
    setOrientation(defaultOrientation);
    broadcastChange(p, defaultOrientation, zoomValue as number, zoomMode as ZoomMode);
  };

  const handleOrientationToggle = () => {
    const next: Orientation = (orientation as Orientation) === 'portrait' ? 'landscape' : 'portrait';
    setOrientation(next);
    broadcastChange(preset as ResolutionPreset, next, zoomValue as number, zoomMode as ZoomMode);
  };

  const handleZoomSelect = (value: string) => {
    if (value === 'fit') {
      setZoomMode('fit');
      broadcastChange(preset as ResolutionPreset, orientation as Orientation, 100, 'fit');
    } else if (value === 'custom') {
      setZoomMode('custom');
      const v = Number(customZoomInput) || 100;
      setZoomValue(v);
      broadcastChange(preset as ResolutionPreset, orientation as Orientation, v, 'custom');
    } else {
      const v = Number(value);
      setZoomMode('fixed');
      setZoomValue(v);
      setCustomZoomInput(String(v));
      broadcastChange(preset as ResolutionPreset, orientation as Orientation, v, 'fixed');
    }
  };

  const handleCustomZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomZoomInput(e.target.value);
  };

  const handleCustomZoomCommit = () => {
    let v = Number(customZoomInput);
    if (isNaN(v) || v < 10) v = 10;
    if (v > 500) v = 500;
    setCustomZoomInput(String(v));
    setZoomValue(v);
    setZoomMode('custom');
    broadcastChange(preset as ResolutionPreset, orientation as Orientation, v, 'custom');
  };

  const handleCustomZoomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCustomZoomCommit();
  };

  const currentZoomMode = zoomMode as ZoomMode;
  const currentZoom = zoomValue as number;
  const isFree = (preset as ResolutionPreset) === 'free';

  // Determine select value
  const selectValue = currentZoomMode === 'fit'
    ? 'fit'
    : currentZoomMode === 'custom'
      ? 'custom'
      : String(currentZoom);

  return (
    <Wrapper>
      <Row>
        <SwitcherRow ref={containerRef}>
          <Slider $left={pos.left} $width={pos.width} $animate={animate} />
          {PRESET_KEYS.map((key) => (
            <PresetBtn
              key={key}
              ref={(el) => setRef(key, el)}
              type="button"
              $active={key === (preset as ResolutionPreset)}
              onClick={() => handlePresetClick(key)}
            >
              {BUTTON_LABELS[key]}
            </PresetBtn>
          ))}
        </SwitcherRow>
        <OrientBtn
          type="button"
          $active={(orientation as Orientation) === 'landscape'}
          onClick={handleOrientationToggle}
          title={(orientation as Orientation) === 'portrait' ? 'Zu Landscape wechseln' : 'Zu Portrait wechseln'}
          style={{ opacity: isFree ? 0.4 : 1, pointerEvents: isFree ? 'none' : 'auto' }}
        >
          <MdScreenRotation size={16} />
        </OrientBtn>
      </Row>
        <Row>
          <ZoomSelect
            value={selectValue}
            onChange={(e) => handleZoomSelect(e.target.value)}
          >
            {ZOOM_OPTIONS.map((z) => (
              <option key={z} value={String(z)}>{z}%</option>
            ))}
            {!isFree && <option value="fit">Fit to Preview</option>}
            <option value="custom">Freie Eingabe</option>
          </ZoomSelect>
          {currentZoomMode === 'custom' && (
            <Row>
              <ZoomInput
                type="number"
                min={10}
                max={500}
                value={customZoomInput}
                onChange={handleCustomZoomChange}
                onBlur={handleCustomZoomCommit}
                onKeyDown={handleCustomZoomKeyDown}
              />
              <span style={{ fontSize: '10px', color: '#888' }}>%</span>
            </Row>
          )}
          {currentZoomMode === 'fit' && (
            <span style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 600 }}>
              auto
            </span>
          )}
        </Row>
    </Wrapper>
  );
};

export default ResolutionSwitcher;
