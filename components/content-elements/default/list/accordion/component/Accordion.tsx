'use client';

import { FC, useState } from 'react';
import { AccordionItem, AccordionProps } from './Accordion.types';
import { AccordionContainer } from './Accordion.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Wrapper from '../../../layout/wrapper';
import { CaretRightIcon } from '../../../icons';
import { getPrimaryColor } from '../../../constants';
import AccordionPanel from './AccordionPanel';

const Accordion: FC<AccordionProps> = ({
  items = [],
  className,
  $innerWidth = 'small',
  $backgroundColor,
  $textColor,
  defaultIcon = CaretRightIcon,
  $defaultIconColor = getPrimaryColor()['700'],
  allowMultiple = false,
  initialOpenIndex = null,
  $panelBackgroundColor = getPrimaryColor()['0'],
}) => {
  const elementClassName = getElementClassName('accordion');

  const [openIndexes, setOpenIndexes] = useState<number[]>(() => {
    if (
      initialOpenIndex !== null &&
      typeof initialOpenIndex === 'number' &&
      initialOpenIndex >= 0 &&
      initialOpenIndex < items.length
    ) {
      return [initialOpenIndex];
    }
    return [];
  });

  const togglePanel = (idx: number) => {
    setOpenIndexes((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        return allowMultiple ? [...prev, idx] : [idx];
      }
    });
  };

  return (
    <Wrapper
      width="large"
      innerWidth={$innerWidth}
      backgroundColor={$backgroundColor}
      textColor={$textColor}
      className={`${elementClassName} ${className}`}
    >
      <AccordionContainer $panelBackgroundColor={$panelBackgroundColor}>
        {items.map((item: AccordionItem, idx: number) => (
          <AccordionPanel
            key={idx}
            id={`accordion-${idx}`}
            index={idx}
            title={item.title}
            content={item.content}
            isOpen={openIndexes.includes(idx)}
            onToggle={() => togglePanel(idx)}
            icon={item.icon || defaultIcon}
            iconColor={item.iconColor || $defaultIconColor}
            classPrefix={elementClassName}
          />
        ))}
      </AccordionContainer>
    </Wrapper>
  );
};

export default Accordion;
