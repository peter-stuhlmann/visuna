import { FC } from 'react';
import { ListItemProps, ListProps } from './List.types';
import { ListContainer, ListItem } from './List.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Wrapper from '../../../layout/wrapper';
import { getPrimaryColor } from '../../../constants';
import Icon from '../../../icons/icon';

const List: FC<ListProps> = ({
  items = [],
  textColor = getPrimaryColor()['950'],
  highlightColor = getPrimaryColor()['100'],
  defaultIcon = 'MdArrowRight',
  defaultIconColor = getPrimaryColor()['700'],
  unwrapped = false,
  ...wrapperProps
}) => {
  const elementClassName = getElementClassName('list');

  const Content = (
    <ListContainer
      $textColor={textColor}
      className={
        unwrapped ? `${elementClassName} ${wrapperProps.className}` : ''
      }
    >
      {items.map((item: ListItemProps, idx: number) => {
        const iconName = item.icon || defaultIcon;
        const iconColor = item.iconColor || defaultIconColor;

        return (
          <ListItem
            key={'list-item' + idx}
            className={`${elementClassName}-item`}
            $highlightColor={highlightColor}
          >
            <div className={highlightColor ? 'highlighted-text' : 'text'}>
              <span>
                <Icon name={iconName} color={iconColor} />
              </span>
              <span>{item.text}</span>
            </div>
          </ListItem>
        );
      })}
    </ListContainer>
  );

  return unwrapped ? (
    Content
  ) : (
    <Wrapper
      className={`${elementClassName} ${wrapperProps.className}`}
      {...wrapperProps}
    >
      {Content}
    </Wrapper>
  );
};

export default List;
