'use client';

import React from 'react';
import { Icon } from '../content-elements/default';
import {
  ActiveBackground,
  Button,
  Container,
  Wrapper,
} from './PageElementsVisibilityStatus.styles';

export type PageElementVisibility = 'invisible' | 'visible';

const statusToIndex: Record<PageElementVisibility, number> = {
  invisible: 0,
  visible: 1,
};

const indexToStatus: PageElementVisibility[] = ['invisible', 'visible'];

type Props = {
  value: PageElementVisibility;
  onChange: (value: PageElementVisibility) => void;
};

export default function PageElementVisibilityStatus({
  value,
  onChange,
}: Props) {
  const activeIdx = statusToIndex[value];

  const setStatus = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(indexToStatus[idx]);
  };

  return (
    <Wrapper>
      <Container>
        <ActiveBackground $activeIdx={activeIdx} />

        {/* UNSICHTBAR */}
        <Button
          type="button"
          aria-label={
            activeIdx === 0
              ? 'Aktueller Status: Element ist unsichtbar.'
              : 'Element unsichtbar machen'
          }
          onClick={(e) => setStatus(0, e)}
        >
          <Icon name="MdOutlineVisibilityOff" size={20} aria-hidden />
        </Button>

        {/* SICHTBAR */}
        <Button
          type="button"
          aria-label={
            activeIdx === 1
              ? 'Aktueller Status: Element ist sichtbar.'
              : 'Element sichtbar machen'
          }
          onClick={(e) => setStatus(1, e)}
        >
          <Icon name="MdOutlineVisibility" size={20} aria-hidden />
        </Button>
      </Container>
    </Wrapper>
  );
}
