import { FC } from 'react';
import { SubFooterContainer } from './SubFooter.styles';
import { SubFooterProps } from './SubFooter.types';

const SubFooter: FC<SubFooterProps> = ({
  className,
  style,
  backgroundColor = null,
  textColor,
  fontSize,
  align,
  element = 'footer',
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
      as={element}
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
