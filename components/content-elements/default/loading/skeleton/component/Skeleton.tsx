import { FC } from 'react';
import getElementClassName from '../../../utils/getElementClassName';
import { SkeletonProps } from './Skeleton.types';
import { SkeletonContainer } from './Skeleton.styles';

const Skeleton: FC<SkeletonProps> = ({ $width, $height }) => {
  const elementClassName = getElementClassName(`skeleton`);

  return (
    <SkeletonContainer
      className={`${elementClassName}`}
      $width={$width}
      $height={$height}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
