'use client';

import { FC } from 'react';
import {
  AlertBox,
  CloseButton,
  Message,
  SnackbarList,
  SnackbarWrapper,
} from './Status.styles';
import { useStatus } from './StatusContext';

const StatusMessages: FC = () => {
  const { statuses, removeStatus } = useStatus();

  return (
    <SnackbarList>
      {statuses.map((status) => (
        <SnackbarWrapper key={status.id}>
          <AlertBox $type={status.type}>
            <Message>{status.message}</Message>
            <CloseButton onClick={() => removeStatus(status.id)}>
              &times;
            </CloseButton>
          </AlertBox>
        </SnackbarWrapper>
      ))}
    </SnackbarList>
  );
};

export default StatusMessages;
