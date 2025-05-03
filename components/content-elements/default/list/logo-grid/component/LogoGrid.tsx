import { FC, Fragment } from 'react';
import { GridItem, LogoGridProps } from './LogoGrid.types';
import { LogoGridContainer } from './LogoGrid.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Wrapper from '../../../layout/wrapper';
import Image from 'next/image';

const LogoGrid: FC<LogoGridProps> = ({
  className,
  items = [],
  $innerWidth = 'small',
  $backgroundColor,
  $textColor,
  unwrapped = false,
}) => {
  const elementClassName = getElementClassName('logo-grid');

  const Content = (
    <LogoGridContainer className={`${elementClassName}`}>
      {items.map((item: GridItem, idx: number) => {
        return (
          <li key={'grid-item' + idx} className={`${elementClassName}-item`}>
            <Image
              src={item.image.src}
              alt={item.image.alt || ''}
              width={item.image.width || 120}
              height={item.image.height || 120}
            />
          </li>
        );
      })}
    </LogoGridContainer>
  );

  return unwrapped ? (
    <Fragment>{Content}</Fragment>
  ) : (
    <Wrapper
      width="large"
      innerWidth={$innerWidth}
      backgroundColor={$backgroundColor}
      textColor={$textColor}
      className={`${elementClassName}-wrapper ${className}`}
    >
      {Content}
    </Wrapper>
  );
};

export default LogoGrid;
