import { createElement, FC } from 'react';
import { ListItem, ListProps } from './List.types';
import { ListContainer } from './List.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Wrapper from '../../../layout/wrapper';
import { CaretRightIcon } from '../../../icons';
import { getPrimaryColor } from '../../../constants';

const List: FC<ListProps> = ({
  className,
  items = [],
  $innerWidth = 'small',
  $backgroundColor,
  $textColor,
  defaultIcon = CaretRightIcon,
  $defaultIconColor = getPrimaryColor()['700'],
}) => {
  const elementClassName = getElementClassName(`list`);

  return (
    <Wrapper
      width="large"
      innerWidth={$innerWidth}
      backgroundColor={$backgroundColor}
      textColor={$textColor}
      className={`${elementClassName} ${className}`}
    >
      <ListContainer>
        {items.map((item: ListItem, idx: number) => {
          const IconComponent = item.icon || defaultIcon;

          return (
            <li key={'list-item' + idx}>
              {IconComponent && (
                <div className={elementClassName + '-icon'} aria-hidden="true">
                  {createElement(IconComponent, {
                    color: item.iconColor || $defaultIconColor,
                  })}
                </div>
              )}
              {item.text}
            </li>
          );
        })}
      </ListContainer>
    </Wrapper>
  );
};

export default List;
