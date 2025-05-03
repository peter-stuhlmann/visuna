import { createElement, FC, Fragment } from 'react';
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
  unwrapped = false,
}) => {
  const elementClassName = getElementClassName('list');

  const Content = (
    <ListContainer>
      {items.map((item: ListItem, idx: number) => {
        const IconComponent = item.icon || defaultIcon;

        return (
          <li key={'list-item' + idx}>
            <span>
              {IconComponent && (
                <div className={elementClassName + '-icon'} aria-hidden="true">
                  {createElement(IconComponent, {
                    color: item.iconColor || $defaultIconColor,
                  })}
                </div>
              )}
              {item.text}
            </span>
          </li>
        );
      })}
    </ListContainer>
  );

  return unwrapped ? (
    <Fragment>{Content}</Fragment>
  ) : (
    <Wrapper
      width="large"
      innerWidth={$innerWidth}
      backgroundColor={$backgroundColor}
      textColor={$textColor}
      className={`${elementClassName} ${className}`}
    >
      {Content}
    </Wrapper>
  );
};

export default List;
