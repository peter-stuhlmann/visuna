import { FC, ReactElement } from 'react';
import { Container } from './List.styles';
import ListItem from '../content-elements-list-item/ListItem';

type ListProps = {
  children: ReactElement<typeof ListItem> | ReactElement<typeof ListItem>[];
};

const List: FC<ListProps> = ({ children }) => {
  return <Container>{children}</Container>;
};

export default List;
