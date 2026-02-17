import styled, { css } from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  z-index: 9998;
`;

export const PickerContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  font-family: inherit;

  @media (max-width: 900px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: row;

  @media (max-width: 900px) {
    flex-direction: column-reverse;
  }

  @media (max-width: 900px) {
    flex-direction: column; 
    align-items: center;
  }
`;

export const CalendarSection = styled.div`
  display: flex;
  padding: 16px;
  gap: 24px;
  /* border-right: 1px solid #e5e7eb; removed, using border on presets or separate divider */

  @media (max-width: 900px) {
    padding: 8px;
    /* gap: 0; Removed to keep desktop gap for dual calendar (768-900) */
    justify-content: center;
    border-top: none;
    border-bottom: 1px solid #e5e7eb;
  }
`;

export const CalendarWrapper = styled.div<{ $hideOnMobile?: boolean }>`
  width: 280px;

  ${({ $hideOnMobile }) => $hideOnMobile && css`
    @media (max-width: 768px) {
        display: none;
    }
  `}

  @media (max-width: 768px) {
    width: 260px; /* slightly smaller to fit */
  }
`;

export const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
`;

export const NavButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`;

export const WeekDaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
`;

export const WeekDay = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 4px 0;
`;

export const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 2px;
`;

export const DayButton = styled.button<{
  $isSelected?: boolean;
  $isInRange?: boolean;
  $isStart?: boolean;
  $isEnd?: boolean;
  $isToday?: boolean;
  $disabled?: boolean;
}>`
  width: 100%;
  aspect-ratio: 1;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;

  ${({ $disabled }) =>
    $disabled &&
    css`
      color: #d1d5db;
      cursor: not-allowed;
      pointer-events: none;
    `}

  ${({ $isInRange }) =>
    $isInRange &&
    css`
      background-color: #f3e8ff; /* Light purple */
      color: #374151;
    `}

  ${({ $isStart }) =>
    $isStart &&
    css`
      background-color: #7c3aed; /* Purple 600 */
      color: white;
      border-top-left-radius: 50%;
      border-bottom-left-radius: 50%;
    `}

  ${({ $isEnd }) =>
    $isEnd &&
    css`
      background-color: #7c3aed;
      color: white;
      border-top-right-radius: 50%;
      border-bottom-right-radius: 50%;
    `}

  ${({ $isStart, $isEnd }) =>
    $isStart &&
    $isEnd &&
    css`
      border-radius: 50%;
    `}
  
  /* Hoover effect for non-selected items */
  &:hover:not(:disabled) {
    ${({ $isSelected, $isInRange }) =>
      !$isSelected &&
      !$isInRange &&
      css`
        background-color: #f3f4f6;
        border-radius: 50%;
      `}
  }

  /* Today indicator dot */
  ${({ $isToday, $isSelected }) =>
    $isToday &&
    !$isSelected &&
    css`
      &::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background-color: #7c3aed;
        border-radius: 50%;
      }
    `}
`;

export const PresetsSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  width: 160px;
  background-color: #fafafa;
  border-left: 1px solid #e5e7eb;

  @media (max-width: 900px) {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    padding: 10px; 
    box-sizing: border-box;
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    border-left: none;
    overflow-x: visible;
  }

`;

export const PresetButton = styled.button<{ $isActive?: boolean; $hideOnMobile?: boolean }>`
  background: transparent;
  border: none;
  text-align: left;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${({ $isActive }) => ($isActive ? '#7c3aed' : '#374151')};
  background-color: ${({ $isActive }) => ($isActive ? '#f3e8ff' : 'transparent')};
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '400')};
  white-space: nowrap;

  ${({ $hideOnMobile }) => $hideOnMobile && css`
    @media (max-width: 900px) {
        display: none;
    }
  `}

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? '#f3e8ff' : '#f3f4f6')};
  }

  @media (max-width: 900px) {
    /* Bubble / Chip Style */
    background-color: ${({ $isActive }) => ($isActive ? '#f3e8ff' : '#fff')};
    border: 1px solid ${({ $isActive }) => ($isActive ? '#7c3aed' : '#e5e7eb')};
    border-radius: 999px; /* Pill shape */
    padding: 6px 14px;
    font-size: 0.8rem;
    text-align: center;
    color: ${({ $isActive }) => ($isActive ? '#7c3aed' : '#374151')};
    
    &:hover {
        background-color: ${({ $isActive }) => ($isActive ? '#f3e8ff' : '#f9fafb')};
        border-color: ${({ $isActive }) => ($isActive ? '#7c3aed' : '#d1d5db')};
    }
  }
`;

export const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const DateInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 0.875rem;
`;

export const DateInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 12px;
  width: 100px;
  font-size: 0.875rem;
  color: #111;
  outline: none;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 1px #7c3aed;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const ButtonBase = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

export const CancelButton = styled(ButtonBase)`
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;

  &:hover {
    background-color: #f9fafb;
    border-color: #c1c4c9;
  }
`;

export const ApplyButton = styled(ButtonBase)`
  background: #7c3aed;
  border: 1px solid #7c3aed;
  color: white;

  &:hover {
    background-color: #6d28d9;
    border-color: #6d28d9;
  }
`;

export const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  color: #111;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #c1c4c9;
  }
`;
