import { FC } from 'react';

import { GridContainer } from './Grid.styles';
import { GridProps } from './Grid.types';

const Grid: FC<GridProps> = ({ children, columns = 3 }) => {
  return <GridContainer $columns={columns}>{children}</GridContainer>;
};

export default Grid;
