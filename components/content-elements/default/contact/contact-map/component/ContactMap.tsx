'use client';

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

const ContactMap: FC<ContactMapProps> = ({ data }) => {
  const {
    children = '',
    map = {
      center: { lat: 52.520876431051285, lng: 13.409427523605075 },
      zoom: 13,
      markers: [],
    },
    iconLinks = [],
    address = [],
    imagePosition = 'right',
    textColor = getPrimaryColor()['950'],
    elementOverlineValue,
    elementHeadingValue,
    elementHeadingElement,
    elementSublineValue,
  } = data ?? {};

  const elementClassName = getElementClassName('contact-map');

  return (
    <Container
      className={elementClassName}
      $imagePosition={imagePosition}
      $textColor={textColor}
    >
      <div className="text">
        {elementOverlineValue && <Overline value={elementOverlineValue} />}
        {elementHeadingValue && (
          <Heading
            element={elementHeadingElement}
            value={elementHeadingValue}
          />
        )}
        {elementSublineValue && <Subline value={elementSublineValue} />}

        <div>
          {children}
          {address && Array.isArray(address) && address?.length > 0 && (
            <ListItems className={`${elementClassName}-list-items`}>
              {address.map(
                (listItem: { label: string; value: string }, idx: number) => (
                  <div
                    key={`list-item-${idx}`}
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
                )
              )}
            </ListItems>
          )}
          {iconLinks && iconLinks?.length > 0 && (
            <IconLinks>
              {iconLinks.map((icon, idx) => {
                if (!icon.icon) return null;

                return (
                  <Button
                    key={`icon-${idx}`}
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
