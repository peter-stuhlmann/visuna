'use client';

import { FC } from 'react';
import {
  AlertBox,
  CloseButton,
  Message,
  SnackbarList,
  SnackbarWrapper,
  ProgressBar,
} from './Status.styles';
import { useStatus } from './StatusContext';

const StatusMessages: FC = () => {
  const { statuses, removeStatus, duration } = useStatus();

  return (
    <SnackbarList>
      {statuses.map((status) => (
        <SnackbarWrapper key={status.id}>
          <AlertBox $type={status.type}>
            <Message>{status.message}</Message>
            <CloseButton onClick={() => removeStatus(status.id)}>
              &times;
            </CloseButton>
            <ProgressBar $duration={duration}>
              <div />
            </ProgressBar>
          </AlertBox>
        </SnackbarWrapper>
      ))}
    </SnackbarList>
  );
};

export default StatusMessages;
