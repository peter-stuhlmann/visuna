'use client';

import { FC, Fragment, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  ColorBlockWrapper,
  ColorName,
  ColorValue,
  Container,
  HeaderCell,
} from './Colors.styles';
import getContrastColor from '../../content-elements/default/utils/getContrastColor';
import ColorBlock from './ColorBlock';
import { Wrapper } from '@/components/content-elements/default';
import colors from '@/components/content-elements/default/constants/colors';
import { getPrimaryColor } from '@/components/content-elements/default/constants';

const primaryColor = getPrimaryColor();

const Colors: FC = () => {
  const t = useTranslations('Content');
  const containerRef = useRef<HTMLDivElement>(null);

  const colorNames = Object.keys(colors) as Array<keyof typeof colors>;
  const shadeKeys = Object.keys(colors.NEUTRAL) as Array<
    keyof typeof colors.NEUTRAL
  >;
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const totalItems = colorNames.length * shadeKeys.length;

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let newIndex = activeIndex;
    const columns = shadeKeys.length;

    if (e.key === 'ArrowRight') newIndex = activeIndex + 1;
    else if (e.key === 'ArrowLeft') newIndex = activeIndex - 1;
    else if (e.key === 'ArrowDown') newIndex = activeIndex + columns;
    else if (e.key === 'ArrowUp') newIndex = activeIndex - columns;

    if (newIndex >= 0 && newIndex < totalItems) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <Wrapper
      backgroundColor={primaryColor['700']}
      textColor={primaryColor['100']}
      width="large"
    >
      <Container
        $columns={shadeKeys.length}
        onKeyDown={handleContainerKeyDown}
        ref={containerRef}
      >
        <HeaderCell />
        {shadeKeys.map((shade) => (
          <HeaderCell key={shade}>{shade}</HeaderCell>
        ))}

        {colorNames.map((colorName, idx: number) => (
          <Fragment key={colorName}>
            <ColorName>{colorName}</ColorName>
            {shadeKeys.map((shade, shadeIndex) => {
              const colorValue = colors[colorName][shade];
              const textColor = getContrastColor(
                colorValue,
                primaryColor['0'],
                primaryColor['1000']
              );
              return (
                <ColorBlockWrapper key={shade}>
                  <ColorBlock
                    color={colorValue}
                    textColor={textColor}
                    borderColor={primaryColor['700']}
                    tooltipMessage={t('copied')}
                    columns={shadeKeys.length}
                    ariaLabel={`${colorName} ${shade}`}
                    shade={shade}
                    tabIndex={idx === 0 && shadeIndex === 0 ? 0 : -1}
                  />
                  <ColorValue>{colorValue}</ColorValue>
                </ColorBlockWrapper>
              );
            })}
          </Fragment>
        ))}
      </Container>
    </Wrapper>
  );
};

export default Colors;
