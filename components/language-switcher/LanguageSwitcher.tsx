'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { LanguageCode } from '@/components/language-settings/languages';

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

const LangBtn = styled.button<{ $active: boolean }>`
  width: 30px;
  height: 30px;
  padding: 0;
  font-size: 11px;
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

  &:hover {
    color: ${({ $active }) => ($active ? '#fff' : '#111')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

/* ─── Props ────────────────────────────────────────────────────────── */

export type LanguageSwitcherProps = {
  languages: (LanguageCode | string)[];
  activeLanguage: string;
  onLanguageChange: (lang: LanguageCode) => void;
  disabled?: boolean;
  /** If true, listens for and broadcasts preview-language-change events */
  syncGlobal?: boolean;
};

/* ─── Component ────────────────────────────────────────────────────── */

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  languages,
  activeLanguage,
  onLanguageChange,
  disabled = false,
  syncGlobal = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [pos, setPos] = useState({ left: 0, width: 0 });
  const [animate, setAnimate] = useState(false);
  const initRef = useRef(false);

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
    const btn = btnRefs.current.get(activeLanguage);
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
  }, [activeLanguage, languages]);

  // Optional: sync with global language events
  useEffect(() => {
    if (!syncGlobal) return;

    const onRemoteLang = (e: Event) => {
      const lang = (e as CustomEvent<{ language: LanguageCode }>).detail
        ?.language;
      if (lang && lang !== activeLanguage && languages.includes(lang)) {
        onLanguageChange(lang);
      }
    };
    window.addEventListener(
      'preview-language-change',
      onRemoteLang as EventListener
    );
    return () =>
      window.removeEventListener(
        'preview-language-change',
        onRemoteLang as EventListener
      );
  }, [syncGlobal, activeLanguage, onLanguageChange, languages]);

  const handleClick = (lang: LanguageCode) => {
    if (disabled) return;
    onLanguageChange(lang);
    if (syncGlobal) {
      window.dispatchEvent(
        new CustomEvent('preview-language-change', {
          detail: { language: lang },
        })
      );
    }
  };

  return (
    <SwitcherRow ref={containerRef}>
      <Slider $left={pos.left} $width={pos.width} $animate={animate} />
      {languages.map((lang) => (
        <LangBtn
          key={lang}
          ref={(el) => setRef(lang, el)}
          type="button"
          $active={lang === activeLanguage}
          onClick={() => handleClick(lang as LanguageCode)}
          disabled={disabled}
        >
          {lang.toUpperCase()}
        </LangBtn>
      ))}
    </SwitcherRow>
  );
};

export default LanguageSwitcher;
