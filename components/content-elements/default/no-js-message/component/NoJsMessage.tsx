import { FC } from 'react';

import { NoJsMessageProps } from './NoJsMessage.types';

import getElementClassName from '../../utils/getElementClassName';
import { WarningIcon } from '../../core/icons';
import { Message } from './NoJsMessage.styles';
import { getPrimaryColor } from '../../constants';

const NoJsMessage: FC<NoJsMessageProps> = ({
  hideElement,
  message,
  textColor = getPrimaryColor()['950'],
}) => {
  const elementClassName = getElementClassName('no-js-message');

  return (
    <noscript>
      {hideElement && (
        <style>{`${hideElement} { display: none !important; }`}</style>
      )}

      <div className={`${elementClassName}`}>
        <Message>
          <div>
            <WarningIcon color={textColor} />
          </div>
          {message
            ? message
            : 'Bitte aktviere Javascript in Deinen Browsereinstellungen, um diesen Bereich nutzen zu können.'}
        </Message>
      </div>
    </noscript>
  );
};

export default NoJsMessage;
