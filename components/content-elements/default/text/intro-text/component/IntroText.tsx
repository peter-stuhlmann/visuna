import { FC } from 'react';

import { IntroTextContainer } from './IntroText.styles';
import { Button } from '../../..';
import { IntroTextProps } from './IntroText.types';
import { getPrimaryColor } from '../../../constants';

const IntroText: FC<IntroTextProps> = ({
  children = '',
  textColor = getPrimaryColor()['950'],
  ctaButton,
  align = 'left',
  className = '',
}) => {
  return (
    <IntroTextContainer
      className={className}
      $textColor={textColor}
      $align={align}
    >
      {children && <div>{children}</div>}
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
