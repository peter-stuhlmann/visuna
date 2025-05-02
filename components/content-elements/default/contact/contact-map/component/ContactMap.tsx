import { FC } from 'react';
import { ContactMapProps } from './ContactMap.types';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../../constants';
import Wrapper from '../../../layout/wrapper';
import Button from '../../../button/button';
import Heading from '../../../text/heading';
import { Container } from '../../../text/image-text/component/ImageText.styles';
import { IconLinks, ListItems } from './ContactMap.styles';
import Map from '../../../map/map';

const ContactMap: FC<ContactMapProps> = ({
  children = '',
  className = '',
  map = {
    center: [0, 0],
    zoom: 10,
    markers: [],
  },
  heading = '',
  headingType = 'h2',
  subHeading = '',
  iconLinks = [
    { icon: null, href: '#', target: '_blank', variant: 'outlined' },
  ],
  listItems = [{ label: '', value: '' }],
  $imagePosition = 'right',
  $backgroundColor = 'transparent',
  $textColor = getPrimaryColor()['950'],
}) => {
  const elementClassName = getElementClassName(`contact-map`);

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
            {listItems && listItems.length > 0 && (
              <ListItems className={`${elementClassName}-list-items`}>
                {listItems.map((listItem, idx: number) => (
                  <div
                    key={'list-item' + idx}
                    className={`${elementClassName}-list-item`}
                  >
                    <span className={`${elementClassName}-list-item-label`}>
                      {listItem.label}
                    </span>{' '}
                    <span
                      className={`${elementClassName}-list-item-value`}
                      dangerouslySetInnerHTML={{ __html: listItem.value || '' }}
                    />
                  </div>
                ))}
              </ListItems>
            )}
            {iconLinks && iconLinks.length > 0 && (
              <IconLinks>
                {iconLinks.map((icon, idx: number) => {
                  if (!icon.icon) return null;

                  return (
                    <Button
                      key={'icon' + idx}
                      href={icon.href}
                      target={icon.target || '_blank'}
                      variant={icon.variant || 'outlined'}
                      ariaLabel={icon.ariaLabel}
                    >
                      {icon.icon}
                    </Button>
                  );
                })}
              </IconLinks>
            )}
          </div>
        </div>
        <div className="image">
          <Map map={map} />
        </div>
      </Container>
    </Wrapper>
  );
};

export default ContactMap;
