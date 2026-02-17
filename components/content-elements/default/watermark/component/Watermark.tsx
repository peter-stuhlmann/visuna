import Logo from '@/components/Logo';
import { FC } from 'react';
import { LogoWrapper, WatermarkContainer, WatermarkText } from './Watermark.styles';
import Button from '../../core/button';
import type { LanguageCode } from '@/components/language-settings/languages';

const WATERMARK_TEXTS: Record<LanguageCode, { text: string; cta: string }> = {
  de: { text: 'Diese Website wurde mit Visuna erstellt.', cta: 'Jetzt kostenlos anmelden' },
  en: { text: 'This website was built with Visuna.', cta: 'Sign up for free' },
  es: { text: 'Este sitio web fue creado con Visuna.', cta: 'Regístrate gratis' },
  fr: { text: 'Ce site a été créé avec Visuna.', cta: 'Inscrivez-vous gratuitement' },
  ru: { text: 'Этот сайт создан с помощью Visuna.', cta: 'Зарегистрируйтесь бесплатно' },
  tr: { text: 'Bu web sitesi Visuna ile oluşturuldu.', cta: 'Ücretsiz kaydol' },
  pt: { text: 'Este site foi criado com Visuna.', cta: 'Cadastre-se gratuitamente' },
  it: { text: 'Questo sito è stato creato con Visuna.', cta: 'Registrati gratuitamente' },
  zh: { text: '本网站由 Visuna 创建。', cta: '免费注册' },
};

type WatermarkProps = {
  data?: {
    currentLanguage?: LanguageCode;
  };
};

const Watermark: FC<WatermarkProps> = ({ data }) => {
  const locale = data?.currentLanguage ?? 'de';
  const { text, cta } = WATERMARK_TEXTS[locale] ?? WATERMARK_TEXTS.de;

  return (
    <WatermarkContainer>
      <LogoWrapper><Logo /></LogoWrapper>
      <WatermarkText>{text}</WatermarkText>
      <Button href="https://visuna.de">{cta}</Button>
    </WatermarkContainer>
  );
};

export default Watermark;
