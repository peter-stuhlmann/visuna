// NumberInputBlock.tsx
import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import NumberInput from '../content-elements/default/inputs/number-input';

type NumberInputBlockProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
};

const NumberInputBlock: FC<NumberInputBlockProps> = ({
  value,
  onChange,
  label,
  min,
  max,
  step,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <NumberInput
        label={label}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
      />
    </BlockWrapper>
  );
};

export default NumberInputBlock;
