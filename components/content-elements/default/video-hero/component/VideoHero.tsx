import { FC } from 'react';
import { VideoHeroContainer } from './VideoHero.styles';
import { VideoHeroProps } from './VideoHero.types';
// import { Button, Heading, Overline, Subline } from '../../../../default';
import { Button } from '../../../default';
import Video from '../../core/video';
import { getPrimaryColor } from '../../constants';
import BaseText from '../../core/base-text';

const VideoHero: FC<VideoHeroProps> = ({ data }) => {
  const {
    className,
    style,
    // heading,
    // overline,
    // subline,
    text,
    videoObjectFit = 'cover',
    videos,
    overlayColor = getPrimaryColor()['950'],
    overlayOpacity = 0.5,
    ctaButton,
  } = data || {};

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
        {/* {overline && (
          <Overline
            element={elementOverlineElement}
            value={elementOverlineValue}
            textColor={elementOverlineTextColor || getPrimaryColor()['50']}
            align={elementOverlineTextAlign || 'center'}
          />
        )}
        {heading && (
          <Heading
            element={elementHeadingElement}
            value={elementHeadingValue}
            textColor={elementHeadingTextColor || getPrimaryColor()['50']}
            align={elementHeadingTextAlign || 'center'}
          />
        )}
        {subline && (
          <Subline
            element={elementSublineElement}
            value={elementSublineValue}
            textColor={elementSublineTextColor || getPrimaryColor()['50']}
            align={elementSublineTextAlign || 'center'}
          />
        )} */}
        {text && <BaseText value={text.value} />}
        {ctaButton && <Button {...ctaButton}>{ctaButton.children}</Button>}
      </div>
    </VideoHeroContainer>
  );
};

export default VideoHero;
