import { FC } from 'react';

import { ListItemProps, ListProps } from './List.types';
import { ListContainer, ListItem } from './List.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../constants';
import Icon from '../../core/icons/icon';

const List: FC<ListProps> = ({ data }) => {
  const {
    items = [],
    textColor = getPrimaryColor()['950'],
    highlightColor,
  } = data ?? {};

  const elementClassName = getElementClassName('list');

  return (
    <ListContainer $textColor={textColor} className={elementClassName}>
      {items &&
        items.length > 0 &&
        items.map((item: ListItemProps, idx: number) => {
          return (
            <ListItem
              key={`list-item-${idx}`}
              className={`${elementClassName}-item`}
              $highlightColor={highlightColor}
            >
              <div className={highlightColor ? 'highlighted-text' : 'text'}>
                <Icon name={item?.icon?.name} color={item?.icon?.color} />
                <span>{item.text}</span>
              </div>
            </ListItem>
          );
        })}
    </ListContainer>
  );
};

export default List;
