import { FC } from 'react';
import { BlockWrapper } from './BlockWrapper.styles';
import HtmlInput from '../content-elements/default/inputs/html-input/component/HtmlInput';

type HtmlInputBlockProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  name?: string;
};

const HtmlInputBlock: FC<HtmlInputBlockProps> = ({
  value,
  onChange,
  label,
  rows,
  disabled,
  required,
  autoFocus,
  placeholder,
  name,
}) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <HtmlInput
        label={label}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        name={name}
      />
    </BlockWrapper>
  );
};

export default HtmlInputBlock;
