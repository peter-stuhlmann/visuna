'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, ReactNode } from 'react';

import { BlockItemContainer } from './BlockItem.styles';

interface BlockItemProps {
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
  noArrow?: boolean;
}

const BlockItem: FC<BlockItemProps> = ({
  href,
  children,
  icon,
  noArrow = false,
}) => {
  const pathname = usePathname();
  const currentPath = pathname.split('?')[0];
  const isActive = currentPath.startsWith(href as string);

  const content = href ? (
    <Link href={href}>
      {icon} <span className="block-item-label">{children}</span>
    </Link>
  ) : (
    <div>
      {icon} <span className="block-item-label">{children}</span>
    </div>
  );

  return (
    <BlockItemContainer $isActive={isActive} $noArrow={noArrow}>
      {content}
    </BlockItemContainer>
  );
};

export default BlockItem;
