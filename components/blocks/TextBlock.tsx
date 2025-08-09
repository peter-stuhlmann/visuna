import { FC } from 'react';
import { TextInput } from '../content-elements/default';
import { BlockWrapper } from './BlockWrapper.styles';

type TextBlockProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  rows?: number;
};

const TextBlock: FC<TextBlockProps> = ({ value, onChange, label, rows }) => {
  return (
    <BlockWrapper>
      <div>{label}</div>
      <TextInput label={label} value={value} onChange={onChange} rows={rows} />
    </BlockWrapper>
  );
};

export default TextBlock;
