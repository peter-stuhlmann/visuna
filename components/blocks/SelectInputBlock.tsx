import { FC } from 'react';
import SelectInput from '../content-elements/default/inputs/select-input';
import { SelectInputOption } from '../content-elements/default/inputs/select-input/component/SelectInput.types';
import { BlockWrapper } from './BlockWrapper.styles';

type SelectInputBlockProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  options: SelectInputOption[];
};

const SelectInputBlock: FC<SelectInputBlockProps> = ({
  value,
  onChange,
  label,
  options,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <SelectInput
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
      />
    </BlockWrapper>
  );
};

export default SelectInputBlock;
