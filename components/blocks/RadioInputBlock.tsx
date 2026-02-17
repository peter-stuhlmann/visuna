import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import { RadioOptionItem } from '../content-elements/default/inputs/radio-input/component/RadioInput.types';
import RadioInput from '../content-elements/default/inputs/radio-input';

type RadioInputBlockProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: RadioOptionItem[];
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
};

const RadioInputBlock: FC<RadioInputBlockProps> = ({
  value,
  onChange,
  label,
  options,
  disabled,
  orientation,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <RadioInput
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        disabled={disabled}
        orientation={orientation}
      />
    </BlockWrapper>
  );
};

export default RadioInputBlock;
