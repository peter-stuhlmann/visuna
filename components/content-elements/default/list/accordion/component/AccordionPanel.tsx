'use client';

import {
  createElement,
  FC,
  useRef,
  useEffect,
  useState,
  ElementType,
  ReactNode,
  isValidElement,
} from 'react';
import { AccordionPanelProps } from './Accordion.types';

function renderContent(content: ReactNode | ElementType): ReactNode {
  if (
    typeof content === 'function' ||
    (typeof content === 'object' && !isValidElement(content))
  ) {
    return createElement(content as ElementType);
  }
  return content;
}

const AccordionPanel: FC<AccordionPanelProps> = ({
  id,
  title,
  content,
  isOpen,
  onToggle,
  icon,
  iconColor,
  classPrefix,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(isOpen ? ref.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className={`${classPrefix}-item`}>
      <button
        className={`${classPrefix}-summary`}
        aria-expanded={isOpen}
        aria-controls={`${id}-content`}
        id={`${id}-header`}
        onClick={onToggle}
      >
        <span className={`${classPrefix}-title`}>{title}</span>
        <span className={`${classPrefix}-icon`} aria-hidden="true">
          {createElement(icon, {
            color: iconColor,
          })}
        </span>
      </button>
      <div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-header`}
        className={`${classPrefix}-content`}
        style={{
          maxHeight: `${height}px`,
          opacity: isOpen ? 1 : 0,
        }}
        ref={ref}
      >
        <div>{renderContent(content)}</div>
      </div>
      <noscript>
        <div
          className={`${classPrefix}-content`}
          role="region"
          aria-labelledby={`${id}-header`}
          style={{
            maxHeight: `10000px`,
            opacity: 1,
          }}
        >
          <div>{renderContent(content)}</div>
        </div>
      </noscript>
    </div>
  );
};

export default AccordionPanel;
