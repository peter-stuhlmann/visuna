import Link from 'next/link';
import { FC, Fragment } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Locale } from '@/i18n/routing';

import { TableBody, TableHead } from './PropsTable.styles';
import getElementClassName from '../content-elements/default/utils/getElementClassName';
import { ElementProp, ElementType } from './PropsTable.types';
import { IntroText, Wrapper } from '../content-elements/default';
import { getPrimaryColor } from '../content-elements/default/constants';

type PropsTableProps = {
  contentElementProps: ElementProp[];
};

const primaryColor = getPrimaryColor();

const PropsTable: FC<PropsTableProps> = async ({ contentElementProps }) => {
  const locale = await getLocale();
  const t = await getTranslations('Content');

  const elementClassName = getElementClassName(`props-table`);

  return (
    <Wrapper
      width="large"
      innerWidth="small"
      backgroundColor={primaryColor['700']}
      textColor={primaryColor['50']}
      className={elementClassName}
    >
      <IntroText
        heading={t('propsSectionHeading')}
        headingType="h2"
        padding="none"
        textColor={primaryColor['50']}
        align="center"
        margin="none"
        style={{ marginBottom: '4rem' }}
      >
        {t('propsSectionDescription')}
      </IntroText>
      <TableHead>
        <div>{t('props')}</div>
        <div>{t('type')}</div>
        <div>{t('default')}</div>
        <div>{t('description')}</div>
      </TableHead>
      <TableBody>
        {contentElementProps.map((item: ElementProp, idx: number) => (
          <div key={item.name + idx}>
            <div>
              <span>{t('name')}: </span>
              {item.name}
              {item.required && '*'}
            </div>
            <div>
              <span>{t('type')}: </span>
              {item.type.map((type: ElementType, typeIdx: number) => (
                <Fragment key={typeIdx}>
                  {typeof type === 'string' ? (
                    type
                  ) : (
                    <Link href={type.href as string}>{type.name}</Link>
                  )}
                  {typeIdx < item.type.length - 1 && ' | '}
                </Fragment>
              ))}
            </div>
            <div>
              <span>{t('default')}: </span>
              {item.default}
            </div>
            <div>
              <span>{t('description')}:</span>{' '}
              {item.description[locale as Locale]}
            </div>
          </div>
        ))}
      </TableBody>
    </Wrapper>
  );
};

export default PropsTable;
