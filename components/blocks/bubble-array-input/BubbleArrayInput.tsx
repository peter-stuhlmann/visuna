'use client';

import { TextInput } from '@/components/content-elements/default';
import { FC, useState, KeyboardEvent } from 'react';
import styled from 'styled-components';

type Props = {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 44px;
`;

const Bubble = styled.div`
  display: flex;
  align-items: center;
  background: #e5f0ff;
  color: #1e3a8a;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 14px;
`;

const Remove = styled.button`
  background: none;
  border: none;
  margin-left: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #1e3a8a;

  &:hover {
    color: red;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 180px;
`;

const BubbleArrayInput: FC<Props> = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addValue = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;

    onChange([...value, trimmed]);
    setInput('');
  };

  const removeValue = (v: string) => {
    onChange(value.filter((x) => x !== v));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <Wrapper>
      {value.map((v) => (
        <Bubble key={v}>
          {v}
          <Remove onClick={() => removeValue(v)}>×</Remove>
        </Bubble>
      ))}

      <InputWrapper>
        <TextInput
          id="bubble-array-input"
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
        />
      </InputWrapper>
    </Wrapper>
  );
};

export default BubbleArrayInput;
