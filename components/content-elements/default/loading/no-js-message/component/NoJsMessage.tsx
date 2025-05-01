import { FC } from 'react';

import { NoJsMessageProps } from './NoJsMessage.types';

// import { NoJsMessageContainer } from './NoJsMessage.styles';
import Wrapper from '../../../layout/wrapper';
import getElementClassName from '../../../utils/getElementClassName';
import { WarningIcon } from '../../../icons';
import { Message } from './NoJsMessage.styles';
import { getPrimaryColor } from '../../../constants';

const NoJsMessage: FC<NoJsMessageProps> = ({
  className,
  children,
  $backgroundColor,
  $textColor = getPrimaryColor()['950'],
  $width = 'large',
  $innerWidth = 'medium',
  $padding = 'medium',
  $margin = 'none',
}) => {
  const elementClassName = getElementClassName('no-js-message');

  return (
    <noscript>
      <style>{`.${className} { display: none !important; }`}</style>
      <Wrapper
        className={elementClassName + ' ' + className + '-noscript'}
        backgroundColor={$backgroundColor}
        textColor={$textColor}
        width={$width}
        innerWidth={$innerWidth}
        padding={$padding}
        margin={$margin}
      >
        <Message>
          <div>
            <WarningIcon color={$textColor} />
          </div>
          {children
            ? children
            : 'Bitte aktviere Javascript in Deinen Browsereinstellungen, um diesen Bereich nutzen zu können.'}
        </Message>
      </Wrapper>
    </noscript>
  );
};

export default NoJsMessage;
