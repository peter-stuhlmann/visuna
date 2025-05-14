import { FC } from 'react';
import { ContactMapProps } from './ContactMap.types';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../../constants';
import Button from '../../../button/button';
import Heading from '../../../text/heading';
import { Container } from '../../../text/image-text/component/ImageText.styles';
import { IconLinks, ListItems } from './ContactMap.styles';
import Map from '../../../map/map';
import Overline from '../../../text/overline';
import Subline from '../../../text/subline';

const ContactMap: FC<ContactMapProps> = ({
  children = '',
  map = {
    center: [0, 0],
    zoom: 10,
    markers: [],
  },
  iconLinks = [],
  listItems,
  imagePosition = 'right',
  textColor = getPrimaryColor()['950'],
  className = '',
  overline,
  heading,
  subline,
}) => {
  const elementClassName = getElementClassName(`contact-map`);

  return (
    <Container
      className={className}
      $imagePosition={imagePosition}
      $textColor={textColor}
    >
      <div className="text">
        {overline && <Overline value={overline.value} />}
        {heading && <Heading element={heading.element} value={heading.value} />}
        {subline && <Subline value={subline.value} />}

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
      {map && (
        <div className="image">
          <Map map={map} />
        </div>
      )}
    </Container>
  );
};

export default ContactMap;
