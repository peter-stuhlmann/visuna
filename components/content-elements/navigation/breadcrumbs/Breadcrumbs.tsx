import { FC } from 'react';
import Link from 'next/link';

import { BreadcrumbItem, BreadcrumbsProps } from './Breadcrumbs.types';
import { Container } from './Breadcrumbs.styles';
import getElementClassName from '../../utils/getElementClassName';

const BreadcrumbsComponent: FC<BreadcrumbsProps> = ({
  links,
  className = '',
  margin = 'small',
  padding = 'none',
  style,
}) => {
  if (!links || links.length === 0) {
    console.error(
      'Breadcrumbs: The "links" prop is required and should be an array of objects with "label", "href", and "title" properties.'
    );
  }

  const elementClassName = getElementClassName('breadcrumbs');

  return (
    <Container
      className={`${elementClassName} ${className}`}
      style={style}
      $margin={margin}
      $padding={padding}
    >
      {links.map((link: BreadcrumbItem, idx: number) =>
        link.href ? (
          <Link
            key={link.label + idx}
            href={link.href}
            className={link.isActive ? 'is-active' : ''}
            title={link.title}
          >
            <span>{link.label}</span>
          </Link>
        ) : (
          <span
            key={link.label + idx}
            className={link.isActive ? 'is-active' : ''}
            title={link.title}
          >
            <span>{link.label}</span>
          </span>
        )
      )}
    </Container>
  );
};

export default BreadcrumbsComponent;
