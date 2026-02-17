import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import CheckboxInput from '../content-elements/default/inputs/checkbox-input';

type CheckboxInputBlockProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  indeterminate?: boolean;
};

const CheckboxInputBlock: FC<CheckboxInputBlockProps> = ({
  value,
  onChange,
  label,
  disabled,
  indeterminate,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <CheckboxInput
        label={label}
        checked={!!value}
        onChange={onChange}
        disabled={disabled}
        indeterminate={indeterminate}
      />
    </BlockWrapper>
  );
};

export default CheckboxInputBlock;
