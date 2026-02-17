import styled from 'styled-components';

export const CardRow = styled.div<{ $draggable?: boolean; $hidden?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr auto;
  align-items: center;
  gap: 30px;
  padding: ${({ $draggable }) =>
    $draggable ? '12px 16px 12px 70px' : '12px 16px'};
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  opacity: ${({ $hidden }) => ($hidden ? 0.6 : 1)};
  transition: 0.2s ease;

  &:hover {
    background-color: rgba(243, 244, 246, 0.5);
  }

  /* Tablet: <1280px — Row 1: Title, Row 2: Slug + Date, Row 3: Status + Buttons */
  @container resizable-area (max-width: 1280px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px 16px;

    /* NameCell → row 1, full width */
    & > *:nth-child(1) { grid-column: 1 / -1; grid-row: 1; }
    /* SlugCell → row 2, col 1 */
    & > *:nth-child(2) { grid-column: 1; grid-row: 2; }
    /* DateCell → row 2, col 2 */
    & > *:nth-child(3) { grid-column: 2; grid-row: 2; }
    /* VisibilityCell → row 3, col 1 */
    & > *:nth-child(4) { grid-column: 1; grid-row: 3; justify-self: start; }
    /* ActionsCell → row 3, col 2 */
    & > *:nth-child(5) { grid-column: 2; grid-row: 3; justify-self: end; }
  }

  /* Small tablet: <900px — Name own row, Slug own row, Date own row */
  @container resizable-area (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto auto;
    gap: 8px 16px;

    /* NameCell → row 1, full width */
    & > *:nth-child(1) { grid-column: 1 / -1; grid-row: 1; }
    /* SlugCell → row 2, full width */
    & > *:nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
    /* DateCell → row 3, full width */
    & > *:nth-child(3) { grid-column: 1 / -1; grid-row: 3; }
    /* VisibilityCell → row 4, col 1 */
    & > *:nth-child(4) { grid-column: 1; grid-row: 4; justify-self: start; }
    /* ActionsCell → row 4, col 2 */
    & > *:nth-child(5) { grid-column: 2; grid-row: 4; justify-self: end; }
  }

  /* Mobile: <480px — stacked layout */
  @container resizable-area (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto auto;
    gap: 4px;
    padding: 10px 12px;

    & > *:nth-child(1) { grid-column: 1; grid-row: 1; }
    & > *:nth-child(2) { grid-column: 1; grid-row: 2; }
    & > *:nth-child(3) { grid-column: 1; grid-row: 3; }
    & > *:nth-child(4) { grid-column: 1; grid-row: 4; justify-self: start; }
    & > *:nth-child(5) { grid-column: 1; grid-row: 5; justify-self: start; }
  }
`;

export const NameCell = styled.div`
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SlugCell = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;

  & > .slug-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
`;

export const DateCell = styled.div`
  font-size: 13px;
  color: #6b7280;

  @container resizable-area (max-width: 1280px) {
    br { display: none; }
  }
`;

export const VisibilityCell = styled.div`
  display: flex;
  align-items: center;
`;

export const ActionsCell = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  @container resizable-area (max-width: 480px) {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
`;

export const ActionButton = styled.button<{ $backgroundColor?: string }>`
  position: relative;
  z-index: 2;
  width: 34px;
  height: 34px;
  background: ${({ $backgroundColor }) => $backgroundColor || '#fff'};
  border: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  outline: none;
  border-radius: 10px;
  padding: 0;
  box-sizing: content-box;
`;

