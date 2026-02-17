// core/icons/icon.tsx
'use client';

import React, { FC } from 'react';
import type { IconBaseProps } from 'react-icons';
import * as Ai from 'react-icons/ai';
import * as Bi from 'react-icons/bi';
import * as Bs from 'react-icons/bs';
import * as Cg from 'react-icons/cg';
import * as Ci from 'react-icons/ci';
import * as Di from 'react-icons/di';
import * as Fa from 'react-icons/fa';
import * as Fa6 from 'react-icons/fa6';
import * as Fc from 'react-icons/fc';
import * as Fi from 'react-icons/fi';
import * as Gi from 'react-icons/gi';
import * as Go from 'react-icons/go';
import * as Gr from 'react-icons/gr';
import * as Hi from 'react-icons/hi';
import * as Hi2 from 'react-icons/hi2';
import * as Im from 'react-icons/im';
import * as Io from 'react-icons/io';
import * as Io5 from 'react-icons/io5';
import * as Lia from 'react-icons/lia';
import * as Md from 'react-icons/md';
import * as Pi from 'react-icons/pi';
import * as Ri from 'react-icons/ri';
import * as Rx from 'react-icons/rx';
import * as Si from 'react-icons/si';
import * as Sl from 'react-icons/sl';
import * as Tb from 'react-icons/tb';
import * as Tfi from 'react-icons/tfi';
import * as Ti from 'react-icons/ti';
import * as Vsc from 'react-icons/vsc';
import * as Wi from 'react-icons/wi';

type AnyPack = Record<string, React.ComponentType<IconBaseProps>>;
const PACKS: Record<string, AnyPack> = {
  Ai,
  Bi,
  Bs,
  Cg,
  Ci,
  Di,
  Fa,
  Fa6,
  Fc,
  Fi,
  Gi,
  Go,
  Gr,
  Hi,
  Hi2,
  Im,
  Io,
  Io5,
  Lia,
  Md,
  Pi,
  Ri,
  Rx,
  Si,
  Sl,
  Tb,
  Tfi,
  Ti,
  Vsc,
  Wi,
};

// ⚠️ name darf optional und null sein
export type IconProps = {
  name?: string | null;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  role?: string;
};

function detectPackPrefix(name: string): keyof typeof PACKS | undefined {
  const long = ['Fa6', 'Io5', 'Hi2', 'Lia'] as const;
  for (const p of long) if (name.startsWith(p)) return p;

  const three = name.slice(0, 3) as keyof typeof PACKS;
  if (PACKS[three]) return three;

  const two = name.slice(0, 2) as keyof typeof PACKS;
  if (PACKS[two]) return two;

  return undefined;
}

const BaseIcon: FC<IconProps> = ({
  name,
  size,
  color,
  className,
  title,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  role,
}) => {
  // Harte Guard: nur strings rendern
  if (!name || typeof name !== 'string') return null;

  const prefix = detectPackPrefix(name);
  if (!prefix) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Icon] Pack-Präfix für "${name}" nicht erkannt.`);
    }
    return null;
  }

  const pack = PACKS[prefix];
  const Comp = pack?.[name as keyof typeof pack];

  if (typeof Comp !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      const examples = Object.keys(pack).slice(0, 10).join(', ');
      console.warn(
        `[Icon] "${name}" nicht in "${prefix}" gefunden. Beispiele: ${examples} …`
      );
    }
    return null;
  }

  const computedAriaHidden = ariaLabel ? undefined : ariaHidden ?? true;

  return (
    <Comp
      size={size}
      color={color}
      className={className}
      title={title}
      aria-hidden={computedAriaHidden}
      aria-label={ariaLabel}
      role={role}
    />
  );
};

export default BaseIcon;
