import { FC } from 'react';

import { Heading, IntroTextContainer } from './IntroText.styles';
import getElementClassName from '../../../utils/getElementClassName';
import { Button, Wrapper } from '../../..';
import { IntroTextProps } from './IntroText.types';
import { getPrimaryColor } from '../../../constants';

const primaryColor = getPrimaryColor();

const IntroText: FC<IntroTextProps> = ({
  children = '',
  className = '',
  heading = '',
  headingType = 'h1',
  backgroundColor = 'transparent',
  textColor = primaryColor['1000'],
  ctaButton = {},
  margin = 'small',
  width = 'large',
  innerWidth = 'small',
  align = 'left',
  padding = 'medium',
  style,
}) => {
  const {
    href = undefined,
    target = '_self',
    children: buttonText = '',
    onClick: onCtaClick,
  } = ctaButton;

  if (!children && !heading && !buttonText) {
    console.error(
      'IntroText: One of the following props is required: "children", "heading", or "buttonText".'
    );
  }

  if (href && !href.startsWith('/') && !href.startsWith('http')) {
    console.error(
      'IntroText: The "href" prop must start with "/" or "http" / "https".'
    );
  }

  const elementClassName = getElementClassName(`intro-text`);

  return (
    <Wrapper
      className={`${elementClassName} ${className}`}
      withShadow={false}
      backgroundColor={backgroundColor}
      width={width}
      innerWidth={innerWidth}
      margin={margin}
      padding={padding}
      textAlign={align}
      style={style}
    >
      <IntroTextContainer $textColor={textColor} $align={align}>
        {heading && <Heading as={headingType}>{heading}</Heading>}
        {children && <div>{children}</div>}
        {buttonText && (
          <div>
            <Button href={href} target={target} onClick={onCtaClick}>
              {buttonText}
            </Button>
          </div>
        )}
      </IntroTextContainer>
    </Wrapper>
  );
};

export default IntroText;
