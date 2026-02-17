import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import DateInput from '../content-elements/default/inputs/date-input';

type DateInputBlockProps = {
  value: string | null;
  onChange: (value: string | '' | null) => void;
  label: string;
  /** ISO 'YYYY-MM-DD' */
  min?: string;
  max?: string;
};

const DateInputBlock: FC<DateInputBlockProps> = ({
  value,
  onChange,
  label,
  min,
  max,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <DateInput
        label={label}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
      />
    </BlockWrapper>
  );
};

export default DateInputBlock;
