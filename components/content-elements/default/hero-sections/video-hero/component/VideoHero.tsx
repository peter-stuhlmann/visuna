import { FC } from 'react';
import { VideoHeroContainer } from './VideoHero.styles';
import { VideoHeroProps } from './VideoHero.types';
import { Button, Heading, Overline, Subline } from '../../../../default';
import Video from '../../../base/video';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../../text/base-text';

const VideoHero: FC<VideoHeroProps> = ({
  className,
  style,
  heading,
  overline,
  subline,
  text,
  videoObjectFit = 'cover',
  videos,
  overlayColor = getPrimaryColor()['950'],
  overlayOpacity = 0.5,
  ctaButton,
}) => {
  return (
    <VideoHeroContainer
      className={className}
      style={style}
      $overlayColor={overlayColor}
      $overlayOpacity={overlayOpacity}
    >
      <Video objectFit={videoObjectFit} videos={videos} />
      <div className="overlay" />
      <div className="content">
        {overline && (
          <Overline
            element={overline.element}
            value={overline.value}
            color={overline.color || getPrimaryColor()['50']}
            align={overline.align || 'center'}
          />
        )}
        {heading && (
          <Heading
            element={heading.element}
            value={heading.value}
            color={heading.color || getPrimaryColor()['50']}
            align={heading.align || 'center'}
          />
        )}
        {subline && (
          <Subline
            element={subline.element}
            value={subline.value}
            color={subline.color || getPrimaryColor()['50']}
            align={subline.align || 'center'}
          />
        )}
        {text && <BaseText value={text.value} />}
        {ctaButton && <Button {...ctaButton}>{ctaButton.children}</Button>}
      </div>
    </VideoHeroContainer>
  );
};

export default VideoHero;
