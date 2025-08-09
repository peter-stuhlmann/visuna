import { FC } from 'react';
import { ListItemProps, ListProps } from './List.types';
import { ListContainer, ListItem } from './List.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../../constants';
import Icon from '../../../icons/icon';

const List: FC<ListProps> = ({
  items = [],
  textColor = getPrimaryColor()['950'],
  highlightColor = getPrimaryColor()['100'],
  defaultIcon = 'MdArrowRight',
  defaultIconColor = getPrimaryColor()['700'],
}) => {
  const elementClassName = getElementClassName('list');

  return (
    <ListContainer $textColor={textColor} className={`${elementClassName}`}>
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
};

export default List;
