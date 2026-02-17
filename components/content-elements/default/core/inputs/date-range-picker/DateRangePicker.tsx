'use client';

import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/content-elements/default';
import {
  Overlay,
  PickerContainer,
  MainContent,
  CalendarSection,
  CalendarWrapper,
  CalendarHeader,
  NavButton,
  WeekDaysRow,
  WeekDay,
  DaysGrid,
  DayButton,
  PresetsSection,
  PresetButton,
  BottomBar,
  DateInputs,
  DateInput,
  ActionButtons,
  CancelButton,
  ApplyButton,
  TriggerButton,
} from './DateRangePicker.styles';
import { TbCalendar } from 'react-icons/tb';

/* -------------------------------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------------------------------- */
type DateRange = {
  start: Date | null;
  end: Date | null;
};

/** Available preset keys */
export type PresetKey =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_year'
  | 'all_time';

const ALL_PRESETS: { key: PresetKey; label: string; hideOnMobile?: boolean }[] = [
  { key: 'today', label: 'Heute' },
  { key: 'yesterday', label: 'Gestern' },
  { key: 'this_week', label: 'Diese Woche' },
  { key: 'last_week', label: 'Letzte Woche' },
  { key: 'this_month', label: 'Diesen Monat', hideOnMobile: true },
  { key: 'last_month', label: 'Letzten Monat' },
  { key: 'this_year', label: 'Dieses Jahr', hideOnMobile: true },
  { key: 'last_year', label: 'Letztes Jahr', hideOnMobile: true },
  { key: 'all_time', label: 'Gesamter Zeitraum', hideOnMobile: true },
];

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  workspaceCreatedAt?: string | Date;
  placeholder?: string;
  className?: string;
  /** Single date mode: clicking a day selects only that day (start === end) */
  singleDate?: boolean;
  /** Hide the presets sidebar */
  hidePresets?: boolean;
  /** Which presets to show (default: all) */
  presets?: PresetKey[];
};

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------------------------------- */
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const WEEK_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0 = Sonntag, 1 = Montag ... wir wollen Montag als 0 haben für unser Grid
  const day = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
  // Convert to 0(Mon) - 6(Sun)
  return day === 0 ? 6 : day - 1;
}

function isSameDay(d1: Date | null, d2: Date | null) {
  if (!d1 || !d2) return false;
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

function normalizeDate(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function formatDate(d: Date | null) {
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function parseDate(s: string): Date | null {
  const parts = s.split('.');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const date = new Date(y, m, d);
  if (date.getDate() !== d || date.getMonth() !== m || date.getFullYear() !== y) return null;
  return date;
}

/* -------------------------------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------------------------------- */
export default function DateRangePicker({ value, onChange, workspaceCreatedAt, placeholder = 'Zeitraum wählen', className, singleDate = false, hidePresets = false, presets }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  
  // Layout state
  const [isTouchLayout, setIsTouchLayout] = useState(false); // < 900px (Modal, Bubbles)
  const [isSingleCalendar, setIsSingleCalendar] = useState(false); // < 768px (1 Calendar)
  
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left?: number; right?: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
        setIsTouchLayout(window.matchMedia('(max-width: 900px)').matches);
        setIsSingleCalendar(window.matchMedia('(max-width: 768px)').matches);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !isOpen) return;

    // Check for mobile/touch layout
    if (window.matchMedia('(max-width: 900px)').matches) {
        setPosition(null); // Let CSS handle centering
        return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    
    // Smart Positioning
    const spaceRight = window.innerWidth - rect.left; // Space if we align left (growing right)
    const spaceLeft = rect.right; // Space if we align right (growing left)

    // Vertical Space
    const spaceBelow = window.innerHeight - rect.bottom;
    const pickerHeightEstimate = 500; 
    const opensUpwards = spaceBelow < pickerHeightEstimate && rect.top > spaceBelow; 
    
    // Horizontal 
    // Desktop Dual Calendar ~ 750px width (280+280+24+160+padding)
    const pickerWidthEstimate = 760;

    let alignLeft = false;
    
    // Default: Right Align (growing Left).
    // Check if we have enough space on the Left to grow into.
    const fitsLeft = spaceLeft >= pickerWidthEstimate;
    
    // If it DOES NOT fit on the left (Right Align), check if we should specificially align Left.
    // If it fits on neither, pick the one with MORE space.
    if (!fitsLeft && spaceRight > spaceLeft) {
        alignLeft = true;
    }
    // "Also die rechts/links-Ausrichtungserkennung funktioniert noch nicht" -> Likely due to threshold being 350 previously.
    // Now with 760, if spaceLeft is 500 (clips), we flip to Left if spaceRight is > 500.

    const newPos: { top?: number; bottom?: number; left?: number; right?: number } = {};
    
    // Vertical assignment
    if (opensUpwards) {
        newPos.bottom = window.innerHeight - rect.top + 8; // Gap
        newPos.top = undefined;
    } else {
        newPos.top = rect.bottom + 8;
        newPos.bottom = undefined;
    }
    
    // Horizontal assignment
    if (alignLeft) {
         newPos.left = rect.left;
         newPos.right = undefined;
    } else {
         newPos.right = window.innerWidth - rect.right;
         newPos.left = undefined;
    }
    
    setPosition(newPos);
  }, [isOpen]);

  useLayoutEffect(() => {
    updatePosition();
    
    if (isOpen) {
        window.addEventListener('scroll', updatePosition, true); // Capture for all scrolls
        window.addEventListener('resize', updatePosition);
    }
    
    return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);
  
  const [tempRange, setTempRange] = useState<DateRange>({
    start: value?.start ? normalizeDate(value.start) : null,
    end: value?.end ? normalizeDate(value.end) : null,
  });

  const [inputStart, setInputStart] = useState(formatDate(value?.start || null));
  const [inputEnd, setInputEnd] = useState(formatDate(value?.end || null));

  // Update temp state when value changes from outside (optional, usually value drives init)
  // But here we want tempRange to persist while open.
  // Reset when opening:
  useEffect(() => {
    if (isOpen) {
      const d = value.start || new Date();
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
      setTempRange({
        start: value.start ? normalizeDate(value.start) : null,
        end: value.end ? normalizeDate(value.end) : null,
      });
    }
  }, [isOpen, value]);
  
  // Sync inputs
  useEffect(() => {
    setInputStart(formatDate(tempRange.start));
    setInputEnd(formatDate(tempRange.end));
  }, [tempRange]);

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };
   
  const handleClose = () => setIsOpen(false);

  const handleDayClick = (date: Date) => {
    const d = normalizeDate(date);

    if (singleDate) {
        // Single date mode: start and end are the same
        setTempRange({ start: d, end: d });
        return;
    }
    
    // Range logic:
    // 1. If no start, set start
    // 2. If start but no end, set end (swap if needed)
    // 3. If both set, reset and start new range
    
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
        setTempRange({ start: d, end: null });
    } else {
        // We have start, no end
        if (d < tempRange.start) {
            setTempRange({ start: d, end: tempRange.start });
        } else {
            setTempRange({ ...tempRange, end: d });
        }
    }
  };

  const isInRange = (date: Date) => {
    if (!tempRange.start || !tempRange.end) return false;
    const d = normalizeDate(date);
    return d > tempRange.start && d < tempRange.end;
  };

  const isStart = (date: Date) => isSameDay(date, tempRange.start);
  const isEnd = (date: Date) => isSameDay(date, tempRange.end);

  const activePreset = useMemo(() => {
    // Determine if current selection matches a preset
    // Simplified: check standard ranges
    return ''; 
  }, [tempRange]);

  const applyPreset = (type: string) => {
    const today = normalizeDate(new Date());
    let s: Date | null = null;
    let e: Date | null = null;

    switch (type) {
      case 'today':
        s = today; e = today;
        break;
      case 'yesterday':
        const y = new Date(today); y.setDate(y.getDate() - 1);
        s = y; e = y;
        break;
      case 'this_week':
        const day = today.getDay() || 7; 
        s = new Date(today); s.setDate(today.getDate() - day + 1);
        e = new Date(today); e.setDate(today.getDate() - day + 7);
        break;
      case 'last_week':
        const day2 = today.getDay() || 7;
        s = new Date(today); s.setDate(today.getDate() - day2 - 6);
        e = new Date(s); e.setDate(s.getDate() + 6);
        break;
      case 'this_month':
        s = new Date(today.getFullYear(), today.getMonth(), 1);
        e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last_month':
        s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        e = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'this_year':
        s = new Date(today.getFullYear(), 0, 1);
        e = new Date(today.getFullYear(), 11, 31);
        break;
      case 'last_year':
        s = new Date(today.getFullYear() - 1, 0, 1);
        e = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case 'all_time':
        // Safe check for workspaceCreatedAt
        let ws: Date | null = null;
        try {
            if (workspaceCreatedAt) {
                const parsed = new Date(workspaceCreatedAt);
                if (!isNaN(parsed.getTime())) {
                    ws = parsed;
                }
            }
        } catch (err) {
            console.error('Invalid workspaceCreatedAt', err);
        }

        if (ws) {
             s = normalizeDate(ws);
             e = today;
        } else {
            // Fallback if invalid or missing: e.g., 2024-01-01 or just Today
            // Let's default to a safe past date or just Today to avoid NaN
            s = new Date(today.getFullYear() - 1, 0, 1); // 1 year fallback?
            e = today;
        }
        break;
      default: break;
    }
    
    if (s && e) {
      setTempRange({ start: s, end: e });
      setViewDate(new Date(s.getFullYear(), s.getMonth(), 1));
    }
  };

  // Inputs handler
  const handleInputChange = (type: 'start' | 'end', val: string) => {
    if (type === 'start') setInputStart(val);
    else setInputEnd(val);

    const d = parseDate(val);
    if (d) {
        if (type === 'start') {
            setTempRange(prev => ({ ...prev, start: d }));
            setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
        } else {
            setTempRange(prev => ({ ...prev, end: d }));
        }
    }
  };

  return (
    <>
      <TriggerButton 
        ref={triggerRef} 
        onClick={() => setIsOpen(!isOpen)} 
        type="button" 
        className={className}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
         <TbCalendar size={18} />
         {value.start && value.end
            ? (singleDate
                ? formatDate(value.start)
                : `${formatDate(value.start)} – ${formatDate(value.end)}`)
            : placeholder}
      </TriggerButton>

      {isOpen && createPortal(
        <>
          <Overlay onClick={handleClose} />
          <PickerContainer
            role="dialog"
            aria-modal="true"
            aria-label="Zeitraum wählen"
            onKeyDown={(e) => {
                if (e.key === 'Escape') handleClose();
            }}
            style={
                position ? {
                    position: 'fixed',
                    top: position.top ?? 'auto',
                    bottom: position.bottom ?? 'auto', 
                    right: position.right ?? 'auto',
                    left: position.left ?? 'auto',
                    marginTop: 0,
                } : {}
            }
          >
            <MainContent>
                {/* Calendars */}
                <CalendarSection>
                    {/* Left Calendar (ViewDate) */}
                    <MonthCalendar 
                        year={viewDate.getFullYear()} 
                        month={viewDate.getMonth()} 
                        viewDate={viewDate}
                        setViewDate={setViewDate}
                        tempRange={tempRange}
                        handleDayClick={handleDayClick}
                        isInRange={isInRange}
                        isStart={isStart}
                        isEnd={isEnd}
                        isLeft={true}
                        showNext={isSingleCalendar}
                    />
                    
                    {/* Right Calendar (ViewDate + 1 Month) */}
                    {/* Hidden on mobile */}
                    <CalendarWrapper $hideOnMobile>
                        <MonthCalendar 
                        year={viewDate.getMonth() === 11 ? viewDate.getFullYear() + 1 : viewDate.getFullYear()} 
                        month={viewDate.getMonth() === 11 ? 0 : viewDate.getMonth() + 1}
                        viewDate={viewDate}
                        setViewDate={setViewDate}
                        tempRange={tempRange}
                        handleDayClick={handleDayClick}
                        isInRange={isInRange}
                        isStart={isStart}
                        isEnd={isEnd}
                        isLeft={false}
                        />
                    </CalendarWrapper>
                </CalendarSection>
                
                {/* Presets (Right Side as requested) */}
                {!hidePresets && (
                <PresetsSection>
                    {(presets
                      ? ALL_PRESETS.filter(p => presets.includes(p.key))
                      : ALL_PRESETS
                    ).map(p => (
                      <PresetButton
                        key={p.key}
                        $hideOnMobile={p.hideOnMobile}
                        onClick={() => applyPreset(p.key)}
                      >
                        {p.label}
                      </PresetButton>
                    ))}
                </PresetsSection>
                )}
            </MainContent>

            <BottomBar>
                <DateInputs>
                    <DateInput 
                        value={inputStart}
                        onChange={(e) => handleInputChange('start', e.target.value)}
                        placeholder="DD.MM.YYYY"
                        aria-label="Startdatum"
                    />
                    {!singleDate && (
                      <>
                        <span>–</span>
                        <DateInput 
                            value={inputEnd}
                            onChange={(e) => handleInputChange('end', e.target.value)}
                            placeholder="DD.MM.YYYY"
                            aria-label="Enddatum"
                        />
                      </>
                    )}
                </DateInputs>
                
                <ActionButtons>
                    <CancelButton onClick={handleClose}>Abbrechen</CancelButton>
                    <ApplyButton onClick={handleApply}>Übernehmen</ApplyButton>
                </ActionButtons>
            </BottomBar>
          </PickerContainer>
        </>,
        document.body
      )}
    </>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Sub-Components
 * ------------------------------------------------------------------------------------------------- */
type CalendarProps = {
    year: number;
    month: number;
    viewDate: Date;
    setViewDate: (d: Date) => void;
    tempRange: DateRange;
    handleDayClick: (d: Date) => void;
    isInRange: (d: Date) => boolean;
    isStart: (d: Date) => boolean;
    isEnd: (d: Date) => boolean;
    isLeft: boolean;
    showNext?: boolean;
};

function MonthCalendar({ year, month, viewDate, setViewDate, handleDayClick, isInRange, isStart, isEnd, isLeft, showNext = false }: CalendarProps) {
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = normalizeDate(new Date());

    const handlePrev = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNext = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handlePrevYear = () => {
        setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    };

    const handleNextYear = () => {
        setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    };

    return (
        <CalendarWrapper>
            <CalendarHeader>
                {isLeft ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <NavButton onClick={handlePrevYear} aria-label="Vorheriges Jahr">
                            <Icon name="MdKeyboardDoubleArrowLeft" size={20} />
                        </NavButton>
                        <NavButton onClick={handlePrev} aria-label="Vorheriger Monat">
                            <Icon name="MdChevronLeft" size={20} />
                        </NavButton>
                    </div>
                ) : (
                    <div />
                )}
                <span>
                    {new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date(year, month))}
                </span>
                {!isLeft || showNext ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <NavButton onClick={handleNext} aria-label="Nächster Monat">
                            <Icon name="MdChevronRight" size={20} />
                        </NavButton>
                        <NavButton onClick={handleNextYear} aria-label="Nächstes Jahr">
                            <Icon name="MdKeyboardDoubleArrowRight" size={20} />
                        </NavButton>
                    </div>
                ) : (
                    <div />
                )}
            </CalendarHeader>

            <WeekDaysRow>
                {WEEK_DAYS.map(d => <WeekDay key={d}>{d}</WeekDay>)}
            </WeekDaysRow>

            <DaysGrid>
                {/* Empty slots */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                
                {/* Days */}
                {Array.from({ length: days }).map((_, i) => {
                    const date = new Date(year, month, i + 1);
                    const start = isStart(date);
                    const end = isEnd(date);
                    const inRange = isInRange(date);
                    const isToday = isSameDay(date, today);
                    const selected = start || end;
                    const day = i + 1;
                    const disabled = false; // Implement min/max date if needed

                    return (
                        <DayButton
                            key={i}
                            type="button"
                            onClick={() => handleDayClick(date)}
                            $isSelected={selected}
                            $isInRange={inRange}
                            $isStart={start}
                            $isEnd={end}
                            $isToday={isToday}
                            $disabled={disabled}
                            aria-label={formatDate(date)}
                            aria-current={isToday ? 'date' : undefined}
                        >
                            {day}
                        </DayButton>
                    );
                })}
            </DaysGrid>
        </CalendarWrapper>
    );
}
