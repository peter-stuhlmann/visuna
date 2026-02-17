import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import SwitchInput from '../content-elements/default/inputs/switch-input';

type SwitchInputBlockProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

const SwitchInputBlock: FC<SwitchInputBlockProps> = ({
  value,
  onChange,
  label,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <SwitchInput label={label} checked={!!value} onChange={onChange} />
    </BlockWrapper>
  );
};

export default SwitchInputBlock;
