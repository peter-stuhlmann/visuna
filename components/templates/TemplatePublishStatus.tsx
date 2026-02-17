'use client';

import React from 'react';
import { Icon } from '@/components/content-elements/default';
import {
  ActiveBackground,
  Button,
  Container,
  Wrapper,
} from '@/components/page-elements-visibility-status/PageElementsVisibilityStatus.styles';

export type TemplatePublishStatusValue = 'active' | 'inactive';

const statusToIndex: Record<TemplatePublishStatusValue, number> = {
  inactive: 0,
  active: 1,
};

const indexToStatus: TemplatePublishStatusValue[] = ['inactive', 'active'];

type Props = {
  value: TemplatePublishStatusValue;
  onChange: (value: TemplatePublishStatusValue) => void;
};

export default function TemplatePublishStatus({
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

        {/* INAKTIV */}
        <Button
          type="button"
          aria-label={
            activeIdx === 0
              ? 'Aktueller Status: Template ist inaktiv.'
              : 'Template deaktivieren'
          }
          onClick={(e) => setStatus(0, e)}
        >
          <Icon name="MdOutlineVisibilityOff" size={20} aria-hidden />
        </Button>

        {/* AKTIV */}
        <Button
          type="button"
          aria-label={
            activeIdx === 1
              ? 'Aktueller Status: Template ist aktiv.'
              : 'Template aktivieren'
          }
          onClick={(e) => setStatus(1, e)}
        >
          <Icon name="MdOutlineVisibility" size={20} aria-hidden />
        </Button>
      </Container>
    </Wrapper>
  );
}
