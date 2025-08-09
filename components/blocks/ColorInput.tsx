import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import ColorInput from '../content-elements/default/inputs/color-input';

type ColorInputBlockProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

const ColorInputBlock: FC<ColorInputBlockProps> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <ColorInput
        label={label}
        value={value}
        onChange={onChange}
        throttleMs={120}
      />
    </BlockWrapper>
  );
};

export default ColorInputBlock;
