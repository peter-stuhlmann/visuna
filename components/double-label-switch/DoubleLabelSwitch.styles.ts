import styled from 'styled-components';

export const SwitchLabel = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  user-select: none;
`;

export const Text = styled.span<{ $active?: boolean }>`
  font-size: 16px;
  color: ${({ $active }) => ($active ? '#000' : '#666')};
`;

export const VisuallyHiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  &:focus-visible + div {
    outline: 2px solid rgba(23, 125, 220, 0.6);
    outline-offset: 2px;
  }
`;

export const SwitchTrack = styled.div<{
  $checked: boolean;
  $disabled?: boolean;
}>`
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ $checked }) =>
    $checked ? '#177ddc' : 'rgba(0,0,0,0.25)'};
  position: relative;
  transition: background-color 0.2s ease;
  flex: 0 0 auto;

  ${({ $disabled }) =>
    $disabled
      ? `
    background-color: rgba(0,0,0,0.15);
  `
      : ''}
`;

export const SwitchThumb = styled.div<{ $checked: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $checked }) => ($checked ? '14px' : '2px')};
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgb(0 35 11 / 20%);
  transition: left 0.2s ease, width 0.2s ease;
`;

export const ThumbPressArea = styled.div`
  /* aktive “press”-Animation über :active am Label */
  ${SwitchLabel}:active ${SwitchThumb} {
    width: 15px;
  }
`;
