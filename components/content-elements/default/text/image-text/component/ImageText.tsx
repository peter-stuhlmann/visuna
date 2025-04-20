import { FC } from 'react';
import { ImageTextProps } from './ImageText.types';
import { Container } from './ImageText.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../../constants';
import Wrapper from '../../../layout/wrapper';
import Heading from '../../heading';
import Button from '../../../button/button';
import Spacer from '../../../layout/spacer';
import Image from '../../../images/image';

const ImageText: FC<ImageTextProps> = ({
  children = '',
  className = '',
  image = { src: undefined, alt: '', width: 0, height: 0 },
  heading = '',
  headingType = 'h2',
  subHeading = '',
  ctaButton = { children: '', href: '', target: '_self' },
  $imagePosition = 'right',
  $backgroundColor = 'transparent',
  $textColor = getPrimaryColor()['950'],
}) => {
  const elementClassName = getElementClassName(`image-text`);

  return (
    <Wrapper
      backgroundColor={$backgroundColor}
      textColor={$textColor}
      width="large"
    >
      <Container
        className={`${elementClassName} ${className}`}
        $imagePosition={$imagePosition}
      >
        <div className="text">
          {subHeading && <div className="sub-heading">{subHeading}</div>}
          {heading && <Heading level={headingType}>{heading}</Heading>}
          <div>
            {children}
            {ctaButton?.children && (
              <>
                <Spacer $size="small" />
                <Button
                  href={ctaButton.href}
                  target={ctaButton.target}
                  {...ctaButton}
                >
                  {ctaButton.children}
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="image">
          {image?.src && (
            <Image
              src={image.src}
              alt={image.alt || ''}
              width={image.width ?? 693}
              height={image.height ?? 462}
            />
          )}
        </div>
      </Container>
    </Wrapper>
  );
};

export default ImageText;
