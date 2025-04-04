import { FC, ReactNode } from 'react';
import { SubFooterContainer } from './SubFooter.styles';

type SubFooterContent =
  | { dangerouslySetInnerHTML: { __html: string }; children?: never }
  | { children: ReactNode; dangerouslySetInnerHTML?: never };

export type SubFooterProps = {
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  align?: 'left' | 'center' | 'right';
} & SubFooterContent;

const SubFooter: FC<SubFooterProps> = ({
  className,
  style,
  backgroundColor = null,
  textColor,
  fontSize,
  align,
  dangerouslySetInnerHTML,
  children,
}) => {
  return (
    <SubFooterContainer
      className={className}
      style={style}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      $fontSize={fontSize}
      $align={align}
    >
      {dangerouslySetInnerHTML ? (
        <div
          className="wrapper"
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        />
      ) : (
        <div className="wrapper">{children}</div>
      )}
    </SubFooterContainer>
  );
};

export default SubFooter;
