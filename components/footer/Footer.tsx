import { FC } from 'react';
import Link from 'next/link';
import { FooterContainer } from './Footer.styles';
import SubFooter from '../content-elements/footer/sub-footer';
import { FooterProps } from './Footer.types';

const Footer: FC<FooterProps> = async ({ data }) => {
  return (
    <FooterContainer>
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
        (typeof data.subFooter === 'string' ? (
          <SubFooter
            align="center"
            dangerouslySetInnerHTML={{ __html: data.subFooter }}
          />
        ) : (
          <SubFooter align="center">{data.subFooter}</SubFooter>
        ))}
    </FooterContainer>
  );
};

export default Footer;
