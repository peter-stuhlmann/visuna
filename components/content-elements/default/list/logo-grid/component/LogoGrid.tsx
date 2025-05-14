import { FC } from 'react';
import { GridItemProps, LogoGridProps } from './LogoGrid.types';
import { GridItem, GridWrapper } from './LogoGrid.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Image from 'next/image';

const LogoGrid: FC<LogoGridProps> = ({
  items = [],
  unwrapped = false,
  itemsPerRow = 5,
  itemsGap = 'm',
  itemBackgroundColor = 'transparent',
  itemBorderRadius = 'l',
  itemBorderColor = 'transparent',
  itemAspectRatio = 'auto',
  ...props
}) => {
  const elementClassName = getElementClassName('logo-grid');

  return (
    <GridWrapper
      $itemsPerRow={itemsPerRow}
      $itemsGap={itemsGap}
      className={unwrapped ? `${elementClassName} ${props.className}` : ''}
    >
      {items.map((item: GridItemProps, idx: number) => (
        <GridItem
          key={'grid-item' + idx}
          className={`${elementClassName}-item`}
          $backgroundColor={itemBackgroundColor}
          $borderRadius={itemBorderRadius}
          $borderColor={itemBorderColor}
          $aspectRatio={itemAspectRatio}
        >
          <Image
            src={item.image.src}
            alt={item.image.alt || ''}
            width={item.image.width || 120}
            height={item.image.height || 120}
          />
        </GridItem>
      ))}
    </GridWrapper>
  );
};

export default LogoGrid;
