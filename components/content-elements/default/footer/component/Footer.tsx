import { FC } from 'react';
import Link from 'next/link';
import { FooterContainer } from './Footer.styles';
import SubFooter from '../../sub-footer/component';
import { FooterProps } from './Footer.types';

const Footer: FC<FooterProps> = ({ data, className = '' }) => {
  return (
    <FooterContainer className={className}>
      <div className="main-footer">
        <div
          className="title"
          dangerouslySetInnerHTML={{ __html: data.title }}
        />
        <nav>
          {data.nav.map((navBlock, idx: number) => (
            <div key={navBlock.title + idx}>
              <div className="title">{navBlock.title}</div>
              <ul>
                {navBlock.links.map((link, linkIdx: number) => (
                  <li key={link.name + linkIdx}>
                    <Link href={link.href}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {!!data.subFooter &&
        (typeof data.subFooter.content === 'string' ? (
          <SubFooter
            data={{
              align: data.subFooter.align,
              fontSize: data.subFooter.fontSize,
              element: 'div',
              dangerouslySetInnerHTML: {
                __html: data.subFooter.content,
              },
            }}
          />
        ) : (
          <SubFooter
            data={{
              align: data.subFooter.align,
              fontSize: data.subFooter.fontSize,
              element: 'div',
              children: data.subFooter.content,
            }}
          />
        ))}
    </FooterContainer>
  );
};

export default Footer;
