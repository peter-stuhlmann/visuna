'use client';

import { FC, useState } from 'react';
import { AccordionItem, AccordionProps } from './Accordion.types';
import { AccordionContainer } from './Accordion.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { CaretRightIcon } from '../../../icons';
import { getPrimaryColor } from '../../../constants';
import AccordionPanel from './AccordionPanel';

const Accordion: FC<AccordionProps> = ({
  items = [],
  defaultIcon = CaretRightIcon,
  defaultIconColor = getPrimaryColor()['950'],
  allowMultiple = false,
  initialOpenIndex = null,
  textColor = getPrimaryColor()['950'],
  panelBackgroundColor = getPrimaryColor()['0'],
  className = '',
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
    <AccordionContainer
      $panelBackgroundColor={panelBackgroundColor}
      $textColor={textColor}
      className={className}
    >
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
          iconColor={item.iconColor || defaultIconColor}
          classPrefix={elementClassName}
        />
      ))}
    </AccordionContainer>
  );
};

export default Accordion;
