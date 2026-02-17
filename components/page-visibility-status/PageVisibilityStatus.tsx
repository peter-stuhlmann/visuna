'use client';

import { PageVisibility } from '@/lib/workspaces/pages/pages.types';
import { Icon } from '../content-elements/default';
import {
  ActiveBackground,
  Button,
  Container,
  Wrapper,
} from './PageVisibilityStatus.styles';

const statusToIndex: Record<PageVisibility, number> = {
  offline: 0,
  maintenance: 1,
  live: 2,
};

const indexToStatus: PageVisibility[] = ['offline', 'maintenance', 'live'];

type Props = {
  value: PageVisibility;
  onChange: (value: PageVisibility) => void;
  isPlannerActive?: boolean;
};

export default function PageVisibilityStatus({
  value,
  onChange,
  isPlannerActive = false,
}: Props) {
  const activeIdx = statusToIndex[value];

  const setStatus = (idx: number) => {
    onChange(indexToStatus[idx]);
  };

  return (
    <Wrapper>
      <Container>
        <ActiveBackground $activeIdx={activeIdx} />

        <Button
          type="button"
          aria-label={
            activeIdx === 0
              ? 'Aktueller Status: Die Seite ist offline.'
              : 'Seite offline schalten'
          }
          onClick={(e) => { e.stopPropagation(); setStatus(0); }}
        >
          <Icon name="MdOutlineVisibilityOff" size={20} aria-hidden />
        </Button>

        <Button
          type="button"
          aria-label={
            activeIdx === 1
              ? 'Aktueller Status: Die Seite befindet sich im Wartungsmodus.'
              : 'Seite in den Wartungsmodus versetzen'
          }
          onClick={(e) => { e.stopPropagation(); setStatus(1); }}
        >
          <Icon name="TbSettingsCode" size={20} aria-hidden />
        </Button>

        <Button
          type="button"
          aria-label={
            activeIdx === 2
              ? 'Aktueller Status: Die Seite ist live.'
              : 'Seite live schalten'
          }
          onClick={(e) => { e.stopPropagation(); setStatus(2); }}
        >
          <Icon name="MdOutlineVisibility" size={20} aria-hidden />
        </Button>
      </Container>

      <Container>
        <Button
          type="button"
          aria-label="Seiten-Sichtbarkeitsstatus bearbeiten"
          $isActive={isPlannerActive}
        >
          {isPlannerActive ? (
            <Icon name="TbClockCheck" size={20} aria-hidden />
          ) : (
            <Icon name="TbClock" size={20} aria-hidden />
          )}
        </Button>
      </Container>
    </Wrapper>
  );
}
