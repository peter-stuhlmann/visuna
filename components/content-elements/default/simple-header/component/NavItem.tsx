'use client';

import Link from 'next/link';

const NavItem = ({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) => {
  return (
    <li>
      <Link href={href} onClick={onClick}>
        {label}
      </Link>
    </li>
  );
};

export default NavItem;
