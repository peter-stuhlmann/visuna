import { FC } from 'react';
import Link from 'next/link';

import { BreadcrumbItem, BreadcrumbsProps } from './Breadcrumbs.types';
import { BreadcrumbsContainer } from './Breadcrumbs.styles';
import { getPrimaryColor } from '../../../constants';

const Breadcrumbs: FC<BreadcrumbsProps> = ({
  links,
  textColor = getPrimaryColor()['950'],
  activeTextColor = getPrimaryColor()['500'],
  dividerColor = getPrimaryColor()['400'],
  className = '',
}) => {
  if (!links || links.length === 0) {
    console.error(
      'Breadcrumbs: The "links" prop is required and should be an array of objects with "label", "href", "title" and optional "isActive" properties.'
    );
  }

  return (
    <BreadcrumbsContainer
      className={className}
      $textColor={textColor}
      $activeTextColor={activeTextColor}
      $dividerColor={dividerColor}
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
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;
