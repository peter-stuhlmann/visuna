import { FC, ReactNode } from 'react';
import EastIcon from '@mui/icons-material/East';

import { Container } from './ListItem.styles';
import { Button } from '../content-elements/default';

type ListItemProps = {
  description: string | ReactNode;
  name: string;
  link: string;
  linkText: string;
};

const ListItem: FC<ListItemProps> = ({ description, link, linkText, name }) => {
  return (
    <Container>
      <h3>{name}</h3>
      <div>{description}</div>
      <Button variant="outlined" href={link}>
        <EastIcon
          sx={{ marginTop: '-2px', marginRight: '0.5rem' }}
          aria-hidden="true"
        />
        {linkText}
      </Button>
    </Container>
  );
};

export default ListItem;
