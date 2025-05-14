import { FC } from 'react';

import { NoJsMessageProps } from './NoJsMessage.types';

import Wrapper from '../../../layout/wrapper';
import getElementClassName from '../../../utils/getElementClassName';
import { WarningIcon } from '../../../icons';
import { Message } from './NoJsMessage.styles';
import { getPrimaryColor } from '../../../constants';

const NoJsMessage: FC<NoJsMessageProps> = ({
  hideElement,
  message,
  textColor = getPrimaryColor()['950'],
  unwrapped = false,
  ...wrapperProps
}) => {
  const elementClassName = getElementClassName('no-js-message');

  const Content = (
    <Message>
      <div>
        <WarningIcon color={textColor} />
      </div>
      {message
        ? message
        : 'Bitte aktviere Javascript in Deinen Browsereinstellungen, um diesen Bereich nutzen zu können.'}
    </Message>
  );

  return (
    <noscript>
      {hideElement && (
        <style>{`${hideElement} { display: none !important; }`}</style>
      )}

      {unwrapped ? (
        <div className={`${elementClassName} ${wrapperProps.className}`}>
          {Content}
        </div>
      ) : (
        <Wrapper
          className={`${elementClassName} ${wrapperProps.className}`}
          {...wrapperProps}
        >
          {Content}
        </Wrapper>
      )}
    </noscript>
  );
};

export default NoJsMessage;
