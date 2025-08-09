import { FC } from 'react';
import { IntroTextContainer } from './IntroText.styles';
import { Button } from '../../..';
import { IntroTextProps } from './IntroText.types';

const IntroText: FC<{ data: IntroTextProps }> = ({ data }) => {
  const { children, textColor = '#000', ctaButton } = data || {};

  return (
    <IntroTextContainer $textColor={textColor}>
      {children && typeof children === 'string' ? (
        <div dangerouslySetInnerHTML={{ __html: children }} />
      ) : (
        <>{children}</>
      )}
      {ctaButton?.children && (
        <div>
          <Button
            href={ctaButton.href}
            target={ctaButton.target}
            onClick={ctaButton.onClick}
            textColor={ctaButton.textColor}
          >
            {ctaButton.children}
          </Button>
        </div>
      )}
    </IntroTextContainer>
  );
};

export default IntroText;
