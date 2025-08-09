'use client';

import React, { FC, useEffect, useState, useId, KeyboardEvent } from 'react';
import styled from 'styled-components';
import { SliderProps } from './Slider.types';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start !important;
  gap: 8px;
`;

const StyledLabel = styled.label`
  font-size: 14px;
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledSlider = styled.input`
  flex: 1;
`;

const ValueDisplay = styled.div`
  min-width: 30px;
  text-align: center;
`;

const Slider: FC<SliderProps> = ({
  label,
  start = 0,
  end = 10,
  steps = 1,
  current = 0,
  onChange,
}) => {
  const [value, setValue] = useState<number>(current);
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setValue(val);
    onChange?.(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setValue((prev) => {
        const next = Math.max(prev - steps, start);
        onChange?.(next);
        return next;
      });
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setValue((prev) => {
        const next = Math.min(prev + steps, end);
        onChange?.(next);
        return next;
      });
    }
  };

  useEffect(() => {
    setValue(current);
  }, [current]);

  return (
    <Container>
      {label && <StyledLabel htmlFor={inputId}>{label}</StyledLabel>}
      <SliderWrapper>
        <StyledSlider
          id={inputId}
          type="range"
          min={start}
          max={end}
          step={steps}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <ValueDisplay>{value}</ValueDisplay>
      </SliderWrapper>
    </Container>
  );
};

export default Slider;
