import getPage from './utils/getPage';
import {
  ContactMap,
  IntroText,
  Metrics,
  Spacer,
} from '@/components/content-elements/default';
import {
  ContactMapData,
  IntroTextData,
  MetricsData,
  SpacerData,
} from '@/components/content-elements/default/types';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { pageExists, pageElements } = await getPage(slug);

  if (!pageExists) {
    return notFound();
  }

  // Sortiere die Elemente nach der Reihenfolge
  const sortedElements = pageElements.sort((a, b) => a.order! - b.order!);

  // Verarbeite alle Elemente asynchron
  const elements = await Promise.all(
    sortedElements.map(async (pageElement) => {
      const elementId = pageElement._id as string;

      if (pageElement.element === 'contact-map') {
        return (
          <ContactMap
            key={elementId}
            data={pageElement.data as ContactMapData}
          />
        );
      }

      if (pageElement.element === 'intro-text') {
        return (
          <IntroText key={elementId} data={pageElement.data as IntroTextData} />
        );
      }

      if (pageElement.element === 'metrics') {
        return (
          <Metrics key={elementId} data={pageElement.data as MetricsData} />
        );
      }

      if (pageElement.element === 'spacer') {
        return <Spacer key={elementId} data={pageElement.data as SpacerData} />;
      }

      return null;
    })
  );

  return <>{elements}</>;
}
