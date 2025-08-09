'use client';

import React from 'react';
import styled from 'styled-components';

interface DoubleLabelSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SwitchWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const SwitchTrack = styled.div<{ checked: boolean }>`
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ checked }) =>
    checked ? '#177ddc' : 'rgba(0,0,0,0.25)'};
  position: relative;
  transition: background-color 0.3s ease;
`;

const SwitchThumb = styled.div<{ checked: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ checked }) => (checked ? '14px' : '2px')};
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px 0 rgb(0 35 11 / 20%);
  transition: left 0.2s ease, width 0.2s ease;

  ${SwitchWrapper}:active & {
    width: 15px;
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  display: none;
`;

const DoubleLabelSwitch: React.FC<DoubleLabelSwitchProps> = ({
  checked,
  onChange,
}) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <SwitchWrapper onClick={handleToggle}>
      <HiddenCheckbox checked={checked} onChange={() => {}} />
      <SwitchTrack checked={checked}>
        <SwitchThumb checked={checked} />
      </SwitchTrack>
    </SwitchWrapper>
  );
};

export default DoubleLabelSwitch;
