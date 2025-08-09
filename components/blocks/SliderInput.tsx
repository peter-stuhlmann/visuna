import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import Slider from '../content-elements/default/inputs/slider';

type SliderInputProps = {
  label: string;
  start: number;
  end: number;
  steps?: number;
  value: number; // ✅ geändert von `current` zu `value`
  onChange: (value: number) => void;
};

const SliderInput: FC<SliderInputProps> = ({
  label,
  start = 0,
  end = 10,
  steps = 1,
  value,
  onChange,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <Slider
        label={label}
        start={start}
        end={end}
        steps={steps}
        current={value} // ✅ mapped auf Slider's `current`-Prop
        onChange={onChange}
      />
    </BlockWrapper>
  );
};

export default SliderInput;
