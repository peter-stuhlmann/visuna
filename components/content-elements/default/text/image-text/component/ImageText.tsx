import { FC } from 'react';
import { ImageTextProps } from './ImageText.types';
import { Container } from './ImageText.styles';
import { getPrimaryColor } from '../../../constants';
import Heading from '../../heading';
import Button from '../../../button/button';
import Spacer from '../../../layout/spacer';
import Image from '../../../images/image';
import Overline from '../../overline';

const ImageText: FC<ImageTextProps> = ({
  children,
  image,
  heading,
  overline,
  ctaButton,
  imagePosition = 'right',
  textColor = getPrimaryColor()['950'],
  className = '',
}) => {
  return (
    <Container
      className={className}
      $imagePosition={imagePosition}
      $textColor={textColor}
    >
      <div className="text">
        {overline && <Overline value={overline.value} />}
        {heading && <Heading element={heading.element} value={heading.value} />}
        <div>
          {children}
          {ctaButton?.children && (
            <>
              <Spacer size="s" />
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
  );
};

export default ImageText;
