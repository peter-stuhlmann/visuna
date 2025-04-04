import { FC, ReactNode } from 'react';
import Link from 'next/link';
import EastIcon from '@mui/icons-material/East';
import { Button } from '@mui/material';

import { Container } from './ListItem.styles';

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
      <Button
        component={Link}
        startIcon={<EastIcon sx={{ marginTop: '-2px' }} aria-hidden="true" />}
        href={link}
        sx={{ color: '#133c59', fontWeight: 600 }}
      >
        {linkText}
      </Button>
    </Container>
  );
};

export default ListItem;
