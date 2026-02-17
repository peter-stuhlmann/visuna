'use client';

import React, { FC } from 'react';
import { DoubleLabelSwitchProps } from './DoubleLabelSwitch.types';
import {
  SwitchLabel,
  SwitchThumb,
  SwitchTrack,
  Text,
  ThumbPressArea,
  VisuallyHiddenCheckbox,
} from './DoubleLabelSwitch.styles';

const DoubleLabelSwitch: FC<DoubleLabelSwitchProps> = ({
  checked,
  onChange,
  ariaLabel,
  label,
  leftLabel,
  rightLabel,
  disabled = false,
  id,
}) => {
  const reactId = React.useId();
  const inputId = id ?? `switch-${reactId}`;

  const hasVisibleLabel = Boolean(label || leftLabel || rightLabel);
  const computedAriaLabel = hasVisibleLabel ? undefined : ariaLabel;

  return (
    <SwitchLabel htmlFor={inputId} $disabled={disabled}>
      {leftLabel ? <Text $active={!checked}>{leftLabel}</Text> : null}
      {label ? <Text $active>{label}</Text> : null}

      <VisuallyHiddenCheckbox
        id={inputId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={computedAriaLabel}
      />

      <SwitchTrack $checked={checked} $disabled={disabled}>
        <ThumbPressArea>
          <SwitchThumb $checked={checked} />
        </ThumbPressArea>
      </SwitchTrack>

      {rightLabel ? <Text $active={checked}>{rightLabel}</Text> : null}
    </SwitchLabel>
  );
};

export default DoubleLabelSwitch;
