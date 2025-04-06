'use client';

import { FC, useState } from 'react';
import { ColorBlock as ColorBlockComponent, Tooltip } from './Colors.styles';

type ColorBlockProps = {
  color: string;
  textColor: string;
  borderColor: string;
  tooltipMessage: string;
  onClick?: () => void;
  columns?: number;
  ariaLabel?: string;
  shade?: string;
  tabIndex?: number;
};

const ColorBlock: FC<ColorBlockProps> = ({
  color,
  textColor,
  borderColor,
  tooltipMessage,
  columns,
  ariaLabel,
  shade,
  tabIndex = 0,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopPropagation();
      handleCopy(color);
      return;
    }

    // Prevent default behavior and handle navigation
    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();

      const blocks = Array.from(
        document.querySelectorAll('.color-block')
      ) as HTMLElement[];
      const current = e.currentTarget as HTMLElement;
      const currentIndex = blocks.indexOf(current);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      if (e.key === 'ArrowRight') {
        newIndex = currentIndex + 1;
      } else if (e.key === 'ArrowLeft') {
        newIndex = currentIndex - 1;
      } else if (e.key === 'ArrowDown') {
        newIndex = currentIndex + (columns ?? 1);
      } else if (e.key === 'ArrowUp') {
        newIndex = currentIndex - (columns ?? 1);
      }

      if (newIndex >= 0 && newIndex < blocks.length) {
        blocks[newIndex].focus();
      }
    }
  };

  return (
    <ColorBlockComponent
      className="color-block"
      aria-label={ariaLabel}
      style={{ backgroundColor: color, color: textColor, borderColor }}
      onClick={() => handleCopy(color)}
      tabIndex={tabIndex}
      role="button"
      onKeyDown={handleKeyDown}
    >
      <span className="shade">{shade}</span>
      {copied && <Tooltip $visible>{tooltipMessage}</Tooltip>}
    </ColorBlockComponent>
  );
};

export default ColorBlock;
